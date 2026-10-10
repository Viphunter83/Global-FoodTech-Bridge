package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"slices"
	"strings"
	"time"

	"github.com/global-foodtech-bridge/iot-service/internal/domain"
	"github.com/global-foodtech-bridge/iot-service/internal/repository/postgres"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type TelemetryService struct {
	repo *postgres.TelemetryRepository
	rdb  *redis.Client
}

func NewTelemetryService(repo *postgres.TelemetryRepository, rdb *redis.Client) *TelemetryService {
	return &TelemetryService{repo: repo, rdb: rdb}
}

const (
	// An excursion stays "open" while readings remain out of range; only its first
	// reading creates an alert and an on-chain violation.
	excursionTTL = 6 * time.Hour
	limitsTTL    = time.Minute
	// Device clocks may drift or readings may be buffered offline for a while.
	maxReadingAge  = 7 * 24 * time.Hour
	maxClockSkew   = 5 * time.Minute
	maxDeviceIDLen = 50
)

var passportClient = &http.Client{Timeout: 5 * time.Second}

func (s *TelemetryService) IngestData(ctx context.Context, req domain.IngestTelemetryRequest) error {
	// 1. Validation
	batchUUID, err := uuid.Parse(req.BatchID)
	if err != nil {
		return ValidationError("invalid batch_id")
	}
	if req.DeviceID == "" || len(req.DeviceID) > maxDeviceIDLen {
		return ValidationError("device_id is required (max 50 chars)")
	}
	if req.TemperatureCelsius == nil {
		return ValidationError("temp is required")
	}
	temp := *req.TemperatureCelsius
	if math.IsNaN(temp) || temp < -100 || temp > 100 {
		return ValidationError("temp must be between -100 and 100 °C")
	}
	if req.Humidity != nil && (*req.Humidity < 0 || *req.Humidity > 100) {
		return ValidationError("humidity must be between 0 and 100 %")
	}
	if req.LocationLat != nil && (*req.LocationLat < -90 || *req.LocationLat > 90) {
		return ValidationError("lat must be between -90 and 90")
	}
	if req.LocationLon != nil && (*req.LocationLon < -180 || *req.LocationLon > 180) {
		return ValidationError("lon must be between -180 and 180")
	}

	now := time.Now()
	timestamp := now
	if req.Timestamp != nil {
		if req.Timestamp.After(now.Add(maxClockSkew)) || req.Timestamp.Before(now.Add(-maxReadingAge)) {
			return ValidationError("ts is too far from server time")
		}
		timestamp = *req.Timestamp
	}

	// 2. The batch decides which devices may report for it and which limits apply.
	// Fail closed: without it we can neither authenticate the device nor check the SLA,
	// so the device should retry later.
	batch, err := s.getBatchLimits(ctx, req.BatchID)
	if err != nil {
		return fmt.Errorf("%w: batch limits: %v", ErrUnavailable, err)
	}
	if len(batch.SensorIDs) > 0 && !slices.Contains(batch.SensorIDs, req.DeviceID) {
		return ValidationError("device is not linked to this batch")
	}

	reading := &domain.Reading{
		ID:                 uuid.New(),
		BatchID:            batchUUID,
		Timestamp:          timestamp,
		TemperatureCelsius: temp,
		LocationLat:        req.LocationLat,
		LocationLon:        req.LocationLon,
		DeviceID:           req.DeviceID,
		Humidity:           req.Humidity,
		Pressure:           req.Pressure,
	}

	// 3. Persist first, so every alert and on-chain violation points to a stored reading
	if err := s.repo.SaveReading(ctx, reading); err != nil {
		return err
	}

	if batch.TrackingStartedAt == nil {
		return nil
	}

	// 4. SLA check (a limit that is not set is not checked)
	violationType, msg := checkLimits(batch, temp, req.Humidity)
	if violationType == "" {
		// Back in range: close any open excursion so the next breach is reported again
		if err := s.rdb.Del(ctx, excursionKey(req.BatchID)).Err(); err != nil {
			log.Printf("Failed to close excursion for batch %s: %v", req.BatchID, err)
		}
		return nil
	}

	opened, err := s.rdb.SetNX(ctx, excursionKey(req.BatchID), violationType, excursionTTL).Result()
	if err != nil {
		log.Printf("Failed to check excursion state for batch %s: %v", req.BatchID, err)
		opened = true // prefer a duplicate report over a missed one
	}
	if !opened {
		s.rdb.Expire(ctx, excursionKey(req.BatchID), excursionTTL)
		return nil
	}

	log.Printf("[ALARM] BATCH %s VIOLATION! %s", req.BatchID, msg)
	alert := &domain.Alert{
		ID:        uuid.New(),
		BatchID:   batchUUID,
		Type:      violationType,
		Message:   msg,
		CreatedAt: now,
		DeviceID:  req.DeviceID,
	}
	if err := s.repo.SaveAlert(ctx, alert); err != nil {
		log.Printf("Failed to save alert: %v", err)
	}

	// Sync with Blockchain (Event Driven via Redis)
	if err := s.publishViolationEvent(req.BatchID, msg, reading.ID.String()); err != nil {
		log.Printf("Failed to publish violation event to Redis: %v", err)
		// Let the next out-of-range reading retry the report
		s.rdb.Del(ctx, excursionKey(req.BatchID))
	}
	return nil
}

func excursionKey(batchID string) string {
	return "excursion:" + batchID
}

func checkLimits(b *passportBatchResponse, temp float64, humidity *float64) (string, string) {
	switch {
	case b.MinTemp != nil && temp < *b.MinTemp:
		return "TEMP_LOW", fmt.Sprintf("Temperature %.2f°C is below minimum %.2f°C", temp, *b.MinTemp)
	case b.MaxTemp != nil && temp > *b.MaxTemp:
		return "TEMP_HIGH", fmt.Sprintf("Temperature %.2f°C is above maximum %.2f°C", temp, *b.MaxTemp)
	case humidity != nil && b.MinHumidity != nil && *humidity < *b.MinHumidity:
		return "HUMIDITY_LOW", fmt.Sprintf("Humidity %.2f%% is below minimum %.2f%%", *humidity, *b.MinHumidity)
	case humidity != nil && b.MaxHumidity != nil && *humidity > *b.MaxHumidity:
		return "HUMIDITY_HIGH", fmt.Sprintf("Humidity %.2f%% is above maximum %.2f%%", *humidity, *b.MaxHumidity)
	}
	return "", ""
}

// passportBatchResponse holds the batch fields the SLA check needs. Limits are
// pointers: a missing limit means "not monitored", not zero.
type passportBatchResponse struct {
	MinTemp           *float64   `json:"min_temp"`
	MaxTemp           *float64   `json:"max_temp"`
	MinHumidity       *float64   `json:"min_humidity"`
	MaxHumidity       *float64   `json:"max_humidity"`
	SensorIDs         []string   `json:"sensor_ids"`
	TrackingStartedAt *time.Time `json:"tracking_started_at"`
}

func (s *TelemetryService) getBatchLimits(ctx context.Context, batchID string) (*passportBatchResponse, error) {
	cacheKey := fmt.Sprintf("limits:%s", batchID)

	// 1. Try Cache (short TTL: sensor links and tracking start change at runtime)
	if val, err := s.rdb.Get(ctx, cacheKey).Result(); err == nil {
		var data passportBatchResponse
		if err := json.Unmarshal([]byte(val), &data); err == nil {
			return &data, nil
		}
	}

	// 2. Fetch from Passport Service
	passportURL := os.Getenv("PASSPORT_SERVICE_URL")
	if passportURL == "" {
		passportURL = "http://passport-service:8080"
	}
	// Accept the URL with or without the /api/v1 suffix
	passportURL = strings.TrimSuffix(strings.TrimSuffix(passportURL, "/"), "/api/v1") + "/api/v1"

	req, err := http.NewRequestWithContext(ctx, "GET", fmt.Sprintf("%s/batches/%s", passportURL, batchID), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("x-api-key", os.Getenv("INTERNAL_API_KEY"))

	resp, err := passportClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("passport service returned %d", resp.StatusCode)
	}

	var data passportBatchResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	// 3. Store in Cache
	payload, _ := json.Marshal(data)
	if err := s.rdb.Set(ctx, cacheKey, string(payload), limitsTTL).Err(); err != nil {
		log.Printf("Failed to cache limits for batch %s: %v", batchID, err)
	}

	return &data, nil
}

func (s *TelemetryService) publishViolationEvent(batchID string, message string, readingID string) error {
	event := map[string]interface{}{
		"batch_id":   batchID,
		"message":    message,
		"reading_id": readingID,
		"timestamp":  time.Now().Format(time.RFC3339),
		"type":       "VIOLATION",
	}

	payload, _ := json.Marshal(event)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Push to Redis Stream for persistence and consumer group support
	err := s.rdb.XAdd(ctx, &redis.XAddArgs{
		Stream: "batch:violations",
		MaxLen: 100000,
		Approx: true,
		Values: map[string]interface{}{
			"payload": string(payload),
		},
	}).Err()

	if err != nil {
		return fmt.Errorf("failed to xadd to redis: %w", err)
	}

	log.Printf("Violation event published to Redis Stream for batch %s", batchID)
	return nil
}

func (s *TelemetryService) GetAlerts(ctx context.Context, batchID string) ([]*domain.Alert, error) {
	// 1. Validation
	if _, err := uuid.Parse(batchID); err != nil {
		return nil, ValidationError("invalid batch_id")
	}

	// 2. Retrieval
	return s.repo.GetAlertsByBatchID(ctx, batchID)
}

func (s *TelemetryService) GetReadings(ctx context.Context, batchID string) ([]*domain.Reading, error) {
	// 1. Validation
	if _, err := uuid.Parse(batchID); err != nil {
		return nil, ValidationError("invalid batch_id")
	}

	// 2. Retrieval
	return s.repo.GetByBatchID(ctx, batchID)
}

func (s *TelemetryService) ResetBatch(ctx context.Context, batchID string) error {
	if _, err := uuid.Parse(batchID); err != nil {
		return ValidationError("invalid batch_id")
	}

	if err := s.repo.DeleteByBatchID(ctx, batchID); err != nil {
		return err
	}

	return s.repo.DeleteAlertsByBatchID(ctx, batchID)
}

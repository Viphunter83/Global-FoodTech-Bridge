package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/global-foodtech-bridge/iot-service/internal/domain"
	"github.com/global-foodtech-bridge/iot-service/internal/repository/postgres"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type TelemetryService struct {
	repo  *postgres.TelemetryRepository
	rdb   *redis.Client
}

func NewTelemetryService(repo *postgres.TelemetryRepository, rdb *redis.Client) *TelemetryService {
	return &TelemetryService{repo: repo, rdb: rdb}
}

func (s *TelemetryService) IngestData(ctx context.Context, req domain.IngestTelemetryRequest) error {
	// 1. Validation
	// Note: We're not validating BatchID existence against DB for this MVP step (cross-service call needed or shared DB access)
	// Assuming shared DB for now since we are in one docker-compose.
	
	batchUUID, err := uuid.Parse(req.BatchID)
	if err != nil {
		return errors.New("invalid batch_id")
	}

	if req.DeviceID == "" {
		return errors.New("device_id is required")
	}

	// 2. Logic: SLA Check
	reading := &domain.Reading{
		ID:                 uuid.New(),
		BatchID:            batchUUID,
		Timestamp:          time.Now(),
		TemperatureCelsius: req.TemperatureCelsius,
		LocationLat:        req.LocationLat,
		LocationLon:        req.LocationLon,
		DeviceID:           req.DeviceID,
		Humidity:           req.Humidity,
		Pressure:           req.Pressure,
	}

	// Fetch Batch Limits from Passport Service
	limits, err := s.getBatchLimits(req.BatchID)
	if err != nil {
		log.Printf("Failed to get batch limits: %v. Using default safe limits.", err)
		// Fallback default
	}

	// Check if we have limits and validate
	if limits != nil {
		violationType := ""
		msg := ""

		if req.TemperatureCelsius < limits.MinTemp {
			violationType = "TEMP_LOW"
			msg = fmt.Sprintf("Temperature %.2f°C is below minimum %.2f°C", req.TemperatureCelsius, limits.MinTemp)
		} else if req.TemperatureCelsius > limits.MaxTemp {
			violationType = "TEMP_HIGH"
			msg = fmt.Sprintf("Temperature %.2f°C is above maximum %.2f°C", req.TemperatureCelsius, limits.MaxTemp)
		} else if req.Humidity != nil && *req.Humidity < limits.MinHumidity {
			violationType = "HUMIDITY_LOW"
			msg = fmt.Sprintf("Humidity %.2f%% is below minimum %.2f%%", *req.Humidity, limits.MinHumidity)
		} else if req.Humidity != nil && *req.Humidity > limits.MaxHumidity {
			violationType = "HUMIDITY_HIGH"
			msg = fmt.Sprintf("Humidity %.2f%% is above maximum %.2f%%", *req.Humidity, limits.MaxHumidity)
		}

		if violationType != "" {
			log.Printf("[ALARM] BATCH %s VIOLATION! %s", req.BatchID, msg)
			
			alert := &domain.Alert{
				ID:        uuid.New(),
				BatchID:   batchUUID,
				Type:      violationType,
				Message:   msg,
				CreatedAt: time.Now(),
				DeviceID:  req.DeviceID,
			}
			
			if err := s.repo.SaveAlert(ctx, alert); err != nil {
				log.Printf("Failed to save alert: %v", err)
			}

			// 2.1 Sync with Blockchain (Event Driven via Redis)
			if err := s.publishViolationEvent(req.BatchID, msg, reading.ID.String()); err != nil {
				log.Printf("Failed to publish violation event to Redis: %v", err)
			}
		}
	} else {
		// Legacy/Fallback Logic
		if req.TemperatureCelsius > -18.0 {
			log.Printf("[ALARM] BATCH %s VIOLATION! Temp: %.2f°C (Legacy Check)", req.BatchID, req.TemperatureCelsius)
		}
	}

	// 4. Persistence
	return s.repo.SaveReading(ctx, reading)
}

type passportBatchResponse struct {
	MinTemp     float64 `json:"min_temp"`
	MaxTemp     float64 `json:"max_temp"`
	MinHumidity float64 `json:"min_humidity"`
	MaxHumidity float64 `json:"max_humidity"`
}

func (s *TelemetryService) getBatchLimits(batchID string) (*passportBatchResponse, error) {
	ctx := context.Background()
	cacheKey := fmt.Sprintf("limits:%s", batchID)

	// 1. Try Cache
	if val, err := s.rdb.Get(ctx, cacheKey).Result(); err == nil {
		var data passportBatchResponse
		if err := json.Unmarshal([]byte(val), &data); err == nil {
			return &data, nil
		}
	}

	// 2. Fetch from Passport Service
	passportURL := os.Getenv("PASSPORT_SERVICE_URL")
	if passportURL == "" {
		passportURL = "http://passport-service:8080/api/v1"
	}

	client := &http.Client{}
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/batches/%s", passportURL, batchID), nil)
	if err != nil {
		return nil, err
	}

	apiKey := os.Getenv("INTERNAL_API_KEY")
	if apiKey != "" {
		req.Header.Set("x-api-key", apiKey)
	}

	resp, err := client.Do(req)
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
	
	// 3. Store in Cache (Expires in 1 hour)
	payload, _ := json.Marshal(data)
	s.rdb.Set(ctx, cacheKey, string(payload), time.Hour)

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
		return nil, errors.New("invalid batch_id")
	}

	// 2. Retrieval
	return s.repo.GetAlertsByBatchID(ctx, batchID)
}

func (s *TelemetryService) GetReadings(ctx context.Context, batchID string) ([]*domain.Reading, error) {
	// 1. Validation
	if _, err := uuid.Parse(batchID); err != nil {
		return nil, errors.New("invalid batch_id")
	}

	// 2. Retrieval
	return s.repo.GetByBatchID(ctx, batchID)
}

func (s *TelemetryService) ResetBatch(ctx context.Context, batchID string) error {
	if _, err := uuid.Parse(batchID); err != nil {
		return errors.New("invalid batch_id")
	}

	if err := s.repo.DeleteByBatchID(ctx, batchID); err != nil {
		return err
	}

	return s.repo.DeleteAlertsByBatchID(ctx, batchID)
}

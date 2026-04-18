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
	"bytes"

	"github.com/global-foodtech-bridge/iot-service/internal/domain"
	"github.com/global-foodtech-bridge/iot-service/internal/repository/postgres"
	"github.com/google/uuid"
)

type TelemetryService struct {
	repo *postgres.TelemetryRepository
}

func NewTelemetryService(repo *postgres.TelemetryRepository) *TelemetryService {
	return &TelemetryService{repo: repo}
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

			// 2.1 Sync with Blockchain (Reliability Hardening)
			if err := s.reportViolationToBlockchain(req.BatchID, msg); err != nil {
				log.Printf("Failed to notarize violation on-chain: %v", err)
			}
		}
	} else {
		// Legacy/Fallback Logic
		if req.TemperatureCelsius > -18.0 {
			log.Printf("[ALARM] BATCH %s VIOLATION! Temp: %.2f°C (Legacy Check)", req.BatchID, req.TemperatureCelsius)
		}
	}

	// 3. Entity Construction
	reading := &domain.Reading{
		ID:                 uuid.New(),
		BatchID:            batchUUID,
		Timestamp:          time.Now(),
		TemperatureCelsius: req.TemperatureCelsius,
		LocationLat:        req.LocationLat,
		LocationLon:        req.LocationLon,
		DeviceID:           req.DeviceID,
	}

	// 4. Persistence
	return s.repo.SaveReading(ctx, reading)
}

type passportBatchResponse struct {
	MinTemp float64 `json:"min_temp"`
	MaxTemp float64 `json:"max_temp"`
}

func (s *TelemetryService) getBatchLimits(batchID string) (*passportBatchResponse, error) {
	passportURL := os.Getenv("PASSPORT_SERVICE_URL")
	if passportURL == "" {
		passportURL = "http://passport-service:8080/api/v1"
	}

	resp, err := http.Get(fmt.Sprintf("%s/batches/%s", passportURL, batchID))
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
	
	return &data, nil
}

func (s *TelemetryService) reportViolationToBlockchain(batchID string, msg string) error {
	blockchainURL := os.Getenv("BLOCKCHAIN_SERVICE_URL")
	if blockchainURL == "" {
		blockchainURL = "http://blockchain-service:3000/api/v1"
	}

	apiKey := os.Getenv("INTERNAL_API_KEY")

	payload := map[string]string{
		"batchId": batchID,
		"details": msg,
	}
	body, _ := json.Marshal(payload)

	var lastErr error
	for attempt := 1; attempt <= 3; attempt++ {
		req, err := http.NewRequest("POST", fmt.Sprintf("%s/blockchain/violation", blockchainURL), bytes.NewBuffer(body))
		if err != nil {
			return err
		}
		req.Header.Set("Content-Type", "application/json")
		if apiKey != "" {
			req.Header.Set("x-api-key", apiKey)
		}

		client := &http.Client{Timeout: 10 * time.Second}
		resp, err := client.Do(req)
		if err == nil {
			defer resp.Body.Close()
			if resp.StatusCode < 400 {
				log.Printf("Successfully notarized violation for batch %s (Attempt %d)", batchID, attempt)
				return nil
			}
			lastErr = fmt.Errorf("blockchain service error: %d", resp.StatusCode)
		} else {
			lastErr = err
		}

		log.Printf("Attempt %d failed to notarize violation: %v. Retrying in 2s...", attempt, lastErr)
		time.Sleep(2 * time.Second)
	}

	return fmt.Errorf("failed to notarize violation after 3 attempts: %v", lastErr)
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

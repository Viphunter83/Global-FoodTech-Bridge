package service

import (
	"context"
	"errors"
	"log"
	"time"

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

	// 2. Logic: Mock Alert
	// Threshold: -18.0 C. If warmer than -18 (e.g., -10, 0), it's a violation.
	if req.TemperatureCelsius > -18.0 {
		log.Printf("[ALARM] BATCH %s VIOLATION! Temp: %.2f°C detected by device %s", req.BatchID, req.TemperatureCelsius, req.DeviceID)
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

func (s *TelemetryService) GetReadings(ctx context.Context, batchID string) ([]*domain.Reading, error) {
	// 1. Validation
	if _, err := uuid.Parse(batchID); err != nil {
		return nil, errors.New("invalid batch_id")
	}

	// 2. Retrieval
	return s.repo.GetByBatchID(ctx, batchID)
}

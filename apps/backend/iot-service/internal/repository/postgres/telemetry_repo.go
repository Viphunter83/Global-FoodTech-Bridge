package postgres

import (
	"context"
	"fmt"

	"github.com/global-foodtech-bridge/iot-service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TelemetryRepository struct {
	db *pgxpool.Pool
}

func NewTelemetryRepository(db *pgxpool.Pool) *TelemetryRepository {
	return &TelemetryRepository{db: db}
}

func (r *TelemetryRepository) SaveReading(ctx context.Context, reading *domain.Reading) error {
	query := `
		INSERT INTO telemetry_readings (id, batch_id, timestamp, temperature_celsius, location_lat, location_lon, device_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err := r.db.Exec(ctx, query,
		reading.ID,
		reading.BatchID,
		reading.Timestamp,
		reading.TemperatureCelsius,
		reading.LocationLat,
		reading.LocationLon,
		reading.DeviceID,
	)

	if err != nil {
		return fmt.Errorf("failed to save reading: %w", err)
	}

	return nil
}

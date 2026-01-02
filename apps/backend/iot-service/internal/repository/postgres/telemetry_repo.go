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

func (r *TelemetryRepository) GetByBatchID(ctx context.Context, batchID string) ([]*domain.Reading, error) {
	query := `
		SELECT id, batch_id, timestamp, temperature_celsius, location_lat, location_lon, device_id
		FROM telemetry_readings
		WHERE batch_id = $1
		ORDER BY timestamp DESC
	`

	rows, err := r.db.Query(ctx, query, batchID)
	if err != nil {
		return nil, fmt.Errorf("failed to query readings: %w", err)
	}
	defer rows.Close()

	var readings []*domain.Reading
	for rows.Next() {
		var r domain.Reading
		if err := rows.Scan(&r.ID, &r.BatchID, &r.Timestamp, &r.TemperatureCelsius, &r.LocationLat, &r.LocationLon, &r.DeviceID); err != nil {
			return nil, fmt.Errorf("failed to scan reading: %w", err)
		}
		readings = append(readings, &r)
	}

	return readings, nil
}

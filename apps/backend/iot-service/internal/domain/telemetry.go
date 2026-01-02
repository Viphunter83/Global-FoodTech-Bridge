package domain

import (
	"time"

	"github.com/google/uuid"
)

// Reading represents a single IoT data point
type Reading struct {
	ID                 uuid.UUID `json:"id"`
	BatchID            uuid.UUID `json:"batch_id"`
	Timestamp          time.Time `json:"timestamp"`
	TemperatureCelsius float64   `json:"temperature_celsius"`
	LocationLat        *float64  `json:"location_lat,omitempty"`
	LocationLon        *float64  `json:"location_lon,omitempty"`
	DeviceID           string    `json:"device_id"`
}

type IngestTelemetryRequest struct {
	BatchID            string   `json:"batch_id"`
	TemperatureCelsius float64  `json:"temp"`
	LocationLat        *float64 `json:"lat,omitempty"`
	LocationLon        *float64 `json:"lon,omitempty"`
	DeviceID           string   `json:"device_id"`
}

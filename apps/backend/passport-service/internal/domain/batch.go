package domain

import (
	"time"

	"github.com/google/uuid"
)

type ValidationStatus string

const (
	StatusPending  ValidationStatus = "PENDING"
	StatusVerified ValidationStatus = "VERIFIED"
)

// ProductBatch represents a production batch of food
type Batch struct {
	ID             uuid.UUID        `json:"id"`
	CreatedAt      time.Time        `json:"created_at"`
	ManufacturerID uuid.UUID        `json:"manufacturer_id"`
	ProductType    string           `json:"product_type"`
	BatchSize      int              `json:"batch_size"`
	USFStatus      ValidationStatus `json:"usf_status"`
	BlockchainHash *string          `json:"blockchain_hash,omitempty"`
}

type CreateBatchRequest struct {
	ManufacturerID string `json:"manufacturer_id"`
	ProductType    string `json:"product_type"`
	BatchSize      int    `json:"batch_size"`
}

type CreateBatchResponse struct {
	BatchID uuid.UUID `json:"batch_id"`
	Status  string    `json:"status"`
}

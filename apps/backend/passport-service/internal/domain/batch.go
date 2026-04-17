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
	ID                 uuid.UUID        `json:"id"`
	CreatedAt          time.Time        `json:"created_at"`
	ManufacturerID     uuid.UUID        `json:"manufacturer_id"`
	ProductType        string           `json:"product_type"`
	BatchSize          int              `json:"batch_size"`
	UnitOfMeasure      string           `json:"unit_of_measure"`
	OriginCountry      string           `json:"origin_country"`
	DestinationCountry string           `json:"destination_country"`
	USFStatus          ValidationStatus `json:"usf_status"`
	BlockchainHash     *string          `json:"blockchain_hash,omitempty"`
	MinTemp            *float64         `json:"min_temp,omitempty"`
	MaxTemp            *float64         `json:"max_temp,omitempty"`
	TokenURI           *string          `json:"token_uri,omitempty"`
	CertificatesIPFS   []string         `json:"certificates_ipfs"`
	TemplateID         *uuid.UUID       `json:"template_id,omitempty"`
}

type CreateBatchRequest struct {
	ManufacturerID     string   `json:"manufacturer_id"`
	ProductType        string   `json:"product_type"`
	BatchSize          int      `json:"batch_size"`
	UnitOfMeasure      string   `json:"unit_of_measure"`
	OriginCountry      string   `json:"origin_country"`
	DestinationCountry string   `json:"destination_country"`
	TokenURI           string   `json:"token_uri,omitempty"`
	CertificatesIPFS   []string `json:"certificates_ipfs"`
	TemplateID         string   `json:"template_id,omitempty"`
}

type UpdateBlockchainRequest struct {
	BlockchainHash string `json:"blockchain_hash" validate:"required"`
}

type CreateBatchResponse struct {
	BatchID uuid.UUID `json:"batch_id"`
	Status  string    `json:"status"`
}

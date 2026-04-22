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

// BatchCertificate represents a compliance document linked to a batch
type BatchCertificate struct {
	Hash string `json:"hash"`
	Type string `json:"type"` // e.g., "PHYTOSANITARY", "HALAL", "FDA"
	Name string `json:"name"`
}

// Batch represents a production batch of food
type Batch struct {
	ID                 uuid.UUID          `json:"id"`
	CreatedAt          time.Time          `json:"created_at"`
	ManufacturerID     uuid.UUID          `json:"manufacturer_id"`
	ProductType        string             `json:"product_type"`
	BatchSize          int                `json:"batch_size"`
	UnitOfMeasure      string             `json:"unit_of_measure"`
	OriginCountry      string             `json:"origin_country"`
	DestinationCountry string             `json:"destination_country"`
	USFStatus          ValidationStatus   `json:"usf_status"`
	BlockchainHash     *string            `json:"blockchain_hash,omitempty"`
	MinTemp            *float64           `json:"min_temp,omitempty"`
	MaxTemp            *float64           `json:"max_temp,omitempty"`
	MinHumidity        *float64           `json:"min_humidity,omitempty"`
	MaxHumidity        *float64           `json:"max_humidity,omitempty"`
	TokenURI           *string            `json:"token_uri,omitempty"`
	Certificates       []BatchCertificate `json:"certificates"`
	TemplateID         *uuid.UUID             `json:"template_id,omitempty"`
	PartnerID          *uuid.UUID             `json:"partner_id,omitempty"`
	MarketingStory     map[string]interface{} `json:"marketing_story,omitempty"`
	PartnerRedirectURL *string                `json:"partner_redirect_url,omitempty"`
	Ingredients        interface{}            `json:"ingredients,omitempty"`
	Nutrition          interface{}            `json:"nutrition,omitempty"`
}

type CreateBatchRequest struct {
	ManufacturerID     string             `json:"manufacturer_id"`
	ProductType        string             `json:"product_type"`
	BatchSize          int                `json:"batch_size"`
	UnitOfMeasure      string             `json:"unit_of_measure"`
	OriginCountry      string             `json:"origin_country"`
	DestinationCountry string             `json:"destination_country"`
	MinTemp            float64            `json:"min_temp,omitempty"`
	MaxTemp            float64            `json:"max_temp,omitempty"`
	MinHumidity        float64            `json:"min_humidity,omitempty"`
	MaxHumidity        float64            `json:"max_humidity,omitempty"`
	TokenURI           string             `json:"token_uri,omitempty"`
	Certificates       []BatchCertificate `json:"certificates"`
	TemplateID         string                 `json:"template_id,omitempty"`
	PartnerID          string                 `json:"partner_id,omitempty"`
	MarketingStory     map[string]interface{} `json:"marketing_story,omitempty"`
	PartnerRedirectURL string                 `json:"partner_redirect_url,omitempty"`
	Ingredients        interface{}            `json:"ingredients,omitempty"`
	Nutrition          interface{}            `json:"nutrition,omitempty"`
}

type UpdateBlockchainRequest struct {
	BlockchainHash string `json:"blockchain_hash" validate:"required"`
}

type CreateBatchResponse struct {
	BatchID uuid.UUID `json:"batch_id"`
	Status  string    `json:"status"`
}

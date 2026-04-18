package domain

import (
	"time"

	"github.com/google/uuid"
)

type ComplianceRule struct {
	ID              uuid.UUID `json:"id"`
	CountryCode     string    `json:"country_code"`
	ProductType     *string   `json:"product_type,omitempty"`
	RequirementName string    `json:"requirement_name"`
	RequirementType string    `json:"requirement_type"` // CERTIFICATE, SLA_TEMP
	MinValue        *float64  `json:"min_value,omitempty"`
	MaxValue        *float64  `json:"max_value,omitempty"`
	IsMandatory     bool      `json:"is_mandatory"`
	Description     string    `json:"description"`
	CreatedAt       time.Time `json:"created_at"`
}

type Partner struct {
	ID                      uuid.UUID `json:"id"`
	Name                    string    `json:"name"`
	VerificationRedirectURL string    `json:"verification_redirect_url"`
	ApiKey                  *string   `json:"api_key,omitempty"`
	CreatedAt               time.Time `json:"created_at"`
	IsActive                bool      `json:"is_active"`
}

package domain

import (
	"time"

	"github.com/google/uuid"
)

type CompanyType string

const (
	CompanyTypeManufacturer CompanyType = "MANUFACTURER"
	CompanyTypeLogistics    CompanyType = "LOGISTICS"
	CompanyTypeRetailer     CompanyType = "RETAILER"
)

type Company struct {
	ID                  uuid.UUID   `json:"id"`
	Name                string      `json:"name"`
	Type                CompanyType `json:"type"`
	WalletAddress       string      `json:"wallet_address"`
	EncryptedPrivateKey string      `json:"-"` // Never expose via API
	ProductionLocation  string      `json:"production_location,omitempty"`
	IsActive            bool        `json:"is_active"`
	CreatedAt           time.Time   `json:"created_at"`
	UpdatedAt           time.Time   `json:"updated_at"`
}

type CreateCompanyRequest struct {
	Name               string      `json:"name"`
	Type               CompanyType `json:"type"`
	ProductionLocation string      `json:"production_location"`
}

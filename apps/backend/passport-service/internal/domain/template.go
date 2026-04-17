package domain

import (
	"time"

	"github.com/google/uuid"
)

type Template struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	IsActive    bool      `json:"is_active"`
	Steps       []Step    `json:"steps,omitempty"`
}

type Step struct {
	ID           uuid.UUID `json:"id"`
	TemplateID   uuid.UUID `json:"template_id"`
	StepOrder    int       `json:"step_order"`
	Name         string    `json:"name"`
	Icon         string    `json:"icon"`
	Description  string    `json:"description"`
	RequiredCert string    `json:"required_cert,omitempty"`
}

package postgres

import (
	"context"
	"fmt"

	"github.com/global-foodtech-bridge/passport-service/internal/domain"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TemplateRepository struct {
	db *pgxpool.Pool
}

func NewTemplateRepository(db *pgxpool.Pool) *TemplateRepository {
	return &TemplateRepository{db: db}
}

func (r *TemplateRepository) List(ctx context.Context) ([]domain.Template, error) {
	query := `
		SELECT id, name, description, created_at, is_active
		FROM supply_chain_templates
		WHERE is_active = TRUE
		ORDER BY name ASC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list templates: %w", err)
	}
	defer rows.Close()

	var templates []domain.Template
	for rows.Next() {
		var t domain.Template
		if err := rows.Scan(&t.ID, &t.Name, &t.Description, &t.CreatedAt, &t.IsActive); err != nil {
			return nil, err
		}
		templates = append(templates, t)
	}

	return templates, nil
}

func (r *TemplateRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Template, error) {
	queryTemplate := `
		SELECT id, name, description, created_at, is_active
		FROM supply_chain_templates
		WHERE id = $1
	`

	var t domain.Template
	err := r.db.QueryRow(ctx, queryTemplate, id).Scan(&t.ID, &t.Name, &t.Description, &t.CreatedAt, &t.IsActive)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get template: %w", err)
	}

	querySteps := `
		SELECT id, template_id, step_order, name, icon, description, required_cert
		FROM template_steps
		WHERE template_id = $1
		ORDER BY step_order ASC
	`

	rows, err := r.db.Query(ctx, querySteps, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get template steps: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var s domain.Step
		if err := rows.Scan(&s.ID, &s.TemplateID, &s.StepOrder, &s.Name, &s.Icon, &s.Description, &s.RequiredCert); err != nil {
			return nil, err
		}
		t.Steps = append(t.Steps, s)
	}

	return &t, nil
}

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
	queryTemplates := `
		SELECT id, name, description, created_at, is_active
		FROM supply_chain_templates
		WHERE is_active = TRUE
		ORDER BY name ASC
	`

	rows, err := r.db.Query(ctx, queryTemplates)
	if err != nil {
		return nil, fmt.Errorf("failed to list templates: %w", err)
	}
	defer rows.Close()

	var templates []domain.Template
	var templateIDs []uuid.UUID
	for rows.Next() {
		var t domain.Template
		if err := rows.Scan(&t.ID, &t.Name, &t.Description, &t.CreatedAt, &t.IsActive); err != nil {
			return nil, err
		}
		templates = append(templates, t)
		templateIDs = append(templateIDs, t.ID)
	}

	if len(templates) == 0 {
		return templates, nil
	}

	// Fetch all steps for these templates
	querySteps := `
		SELECT id, template_id, step_order, name, icon, description, required_cert
		FROM template_steps
		WHERE template_id = ANY($1)
		ORDER BY template_id, step_order ASC
	`

	stepRows, err := r.db.Query(ctx, querySteps, templateIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch steps: %w", err)
	}
	defer stepRows.Close()

	stepsMap := make(map[uuid.UUID][]domain.Step)
	for stepRows.Next() {
		var s domain.Step
		if err := stepRows.Scan(&s.ID, &s.TemplateID, &s.StepOrder, &s.Name, &s.Icon, &s.Description, &s.RequiredCert); err != nil {
			return nil, err
		}
		stepsMap[s.TemplateID] = append(stepsMap[s.TemplateID], s)
	}

	// Attach steps to templates
	for i := range templates {
		templates[i].Steps = stepsMap[templates[i].ID]
		if templates[i].Steps == nil {
			templates[i].Steps = []domain.Step{} // Avoid null in JSON
		}
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
func (r *TemplateRepository) SeedDefaults(ctx context.Context) error {
	defaultTemplates := []struct {
		name        string
		description string
		steps       []struct {
			order int
			name  string
			icon  string
			cert  string
		}
	}{
		{
			name:        "Standard Cold Chain",
			description: "General supply chain for temperature-sensitive products like beef or fish.",
			steps: []struct {
				order int
				name  string
				icon  string
				cert  string
			}{
				{1, "Produced & Packed", "package", ""},
				{2, "Quality Check (AI)", "check", "HEALTH_CERT"},
				{3, "Cold Chain Logistics", "truck", "COLD_CHAIN_CERT"},
				{4, "Regional Hub Arrival", "warehouse", ""},
				{5, "Final Delivery", "fork", ""},
			},
		},
		{
			name:        "Ambient Goods Export",
			description: "Safe transit for dry goods with standard shelf life.",
			steps: []struct {
				order int
				name  string
				icon  string
				cert  string
			}{
				{1, "Harvested & Dried", "leaf", ""},
				{2, "Vacuum Packaging", "package", ""},
				{3, "Export Logistics", "truck", "PHYTOSANITARY_CERT"},
				{4, "Ready for Distribution", "warehouse", ""},
			},
		},
	}

	for _, dt := range defaultTemplates {
		var templateID uuid.UUID
		// check if exists
		err := r.db.QueryRow(ctx, "SELECT id FROM supply_chain_templates WHERE name = $1", dt.name).Scan(&templateID)
		if err != nil {
			if err == pgx.ErrNoRows {
				// insert
				err = r.db.QueryRow(ctx, `
					INSERT INTO supply_chain_templates (name, description) 
					VALUES ($1, $2)
					RETURNING id
				`, dt.name, dt.description).Scan(&templateID)
				if err != nil {
					return fmt.Errorf("failed to insert template %s: %w", dt.name, err)
				}
			} else {
				return fmt.Errorf("failed to check existence of template %s: %w", dt.name, err)
			}
		}

		// Sync steps
		for _, s := range dt.steps {
			var stepID uuid.UUID
			err = r.db.QueryRow(ctx, "SELECT id FROM template_steps WHERE template_id = $1 AND step_order = $2", templateID, s.order).Scan(&stepID)
			if err != nil {
				if err == pgx.ErrNoRows {
					_, err = r.db.Exec(ctx, `
						INSERT INTO template_steps (template_id, step_order, name, icon, required_cert)
						VALUES ($1, $2, $3, $4, $5)
					`, templateID, s.order, s.name, s.icon, s.cert)
					if err != nil {
						return fmt.Errorf("failed to insert step %d for template %s: %w", s.order, dt.name, err)
					}
				} else {
					return fmt.Errorf("failed to check step %d for template %s: %w", s.order, dt.name, err)
				}
			} else {
				// Update existing step to ensure required_cert is set (fix previous partial seeds)
				_, err = r.db.Exec(ctx, `
					UPDATE template_steps 
					SET name = $1, icon = $2, required_cert = $3
					WHERE id = $4
				`, s.name, s.icon, s.cert, stepID)
				if err != nil {
					return fmt.Errorf("failed to update step %d for template %s: %w", s.order, dt.name, err)
				}
			}
		}
	}

	return nil
}

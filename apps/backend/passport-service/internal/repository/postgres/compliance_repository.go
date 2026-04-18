package postgres

import (
	"context"
	"fmt"

	"github.com/global-foodtech-bridge/passport-service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ComplianceRepository struct {
	db *pgxpool.Pool
}

func NewComplianceRepository(db *pgxpool.Pool) *ComplianceRepository {
	return &ComplianceRepository{db: db}
}

func (r *ComplianceRepository) GetRules(ctx context.Context, countryCode string, productType string) ([]domain.ComplianceRule, error) {
	query := `
		SELECT id, country_code, product_type, requirement_name, requirement_type, min_value, max_value, is_mandatory, description, created_at
		FROM compliance_rules
		WHERE (country_code = $1 OR country_code = 'ALL')
		AND (product_type IS NULL OR product_type = $2)
	`
	rows, err := r.db.Query(ctx, query, countryCode, productType)
	if err != nil {
		return nil, fmt.Errorf("failed to query compliance rules: %w", err)
	}
	defer rows.Close()

	var rules []domain.ComplianceRule
	for rows.Next() {
		var rule domain.ComplianceRule
		if err := rows.Scan(
			&rule.ID, &rule.CountryCode, &rule.ProductType, &rule.RequirementName, 
			&rule.RequirementType, &rule.MinValue, &rule.MaxValue, 
			&rule.IsMandatory, &rule.Description, &rule.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan compliance rule: %w", err)
		}
		rules = append(rules, rule)
	}
	return rules, nil
}

func (r *ComplianceRepository) GetPartner(ctx context.Context, id string) (*domain.Partner, error) {
	query := `
		SELECT id, name, verification_redirect_url, api_key, created_at, is_active
		FROM partners
		WHERE id = $1 AND is_active = TRUE
	`
	var p domain.Partner
	err := r.db.QueryRow(ctx, query, id).Scan(
		&p.ID, &p.Name, &p.VerificationRedirectURL, &p.ApiKey, &p.CreatedAt, &p.IsActive,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get partner: %w", err)
	}
	return &p, nil
}

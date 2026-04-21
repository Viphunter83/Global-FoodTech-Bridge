package postgres

import (
	"context"
	"fmt"

	"github.com/global-foodtech-bridge/passport-service/internal/domain"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CompanyRepository struct {
	db *pgxpool.Pool
}

func NewCompanyRepository(db *pgxpool.Pool) *CompanyRepository {
	return &CompanyRepository{db: db}
}

func (r *CompanyRepository) UpdateStatus(ctx context.Context, id uuid.UUID, isActive bool) error {
	query := `
		UPDATE companies
		SET is_active = $1, updated_at = NOW()
		WHERE id = $2
	`
	_, err := r.db.Exec(ctx, query, isActive, id)
	if err != nil {
		return fmt.Errorf("failed to update company status: %w", err)
	}
	return nil
}

func (r *CompanyRepository) Create(ctx context.Context, company *domain.Company) error {
	query := `
		INSERT INTO companies (id, name, type, gln_number, vat_number, wallet_address, encrypted_private_key, production_location, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	_, err := r.db.Exec(ctx, query,
		company.ID,
		company.Name,
		company.Type,
		company.GLNNumber,
		company.VATNumber,
		company.WalletAddress,
		company.EncryptedPrivateKey,
		company.ProductionLocation,
		company.IsActive,
		company.CreatedAt,
		company.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create company: %w", err)
	}
	return nil
}

func (r *CompanyRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Company, error) {
	query := `
		SELECT id, name, type, gln_number, vat_number, wallet_address, encrypted_private_key, production_location, is_active, created_at, updated_at
		FROM companies
		WHERE id = $1
	`
	row := r.db.QueryRow(ctx, query, id)

	var c domain.Company
	err := row.Scan(
		&c.ID,
		&c.Name,
		&c.Type,
		&c.GLNNumber,
		&c.VATNumber,
		&c.WalletAddress,
		&c.EncryptedPrivateKey,
		&c.ProductionLocation,
		&c.IsActive,
		&c.CreatedAt,
		&c.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get company: %w", err)
	}
	return &c, nil
}

func (r *CompanyRepository) GetAll(ctx context.Context) ([]domain.Company, error) {
	query := `
		SELECT id, name, type, gln_number, vat_number, wallet_address, encrypted_private_key, production_location, is_active, created_at, updated_at
		FROM companies
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query companies: %w", err)
	}
	defer rows.Close()

	var companies []domain.Company
	for rows.Next() {
		var c domain.Company
		if err := rows.Scan(
			&c.ID,
			&c.Name,
			&c.Type,
			&c.GLNNumber,
			&c.VATNumber,
			&c.WalletAddress,
			&c.EncryptedPrivateKey,
			&c.ProductionLocation,
			&c.IsActive,
			&c.CreatedAt,
			&c.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan company: %w", err)
		}
		companies = append(companies, c)
	}
	return companies, nil
}

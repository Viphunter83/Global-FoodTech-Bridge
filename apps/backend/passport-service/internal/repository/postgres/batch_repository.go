package postgres

import (
	"context"
	"fmt"
	"github.com/global-foodtech-bridge/passport-service/internal/domain"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type BatchRepository struct {
	db *pgxpool.Pool
}

func NewBatchRepository(db *pgxpool.Pool) *BatchRepository {
	return &BatchRepository{db: db}
}

	func (r *BatchRepository) Create(ctx context.Context, batch *domain.Batch) (uuid.UUID, error) {
	query := `
		INSERT INTO product_batches (
			manufacturer_id, product_type, batch_size, unit_of_measure, 
			origin_country, destination_country, usf_status, 
			blockchain_hash, min_temp, max_temp, token_uri, certificates_ipfs, template_id, partner_id,
			marketing_story, partner_redirect_url, ingredients, nutrition
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
		RETURNING id
	`

	var id uuid.UUID
	err := r.db.QueryRow(ctx, query,
		batch.ManufacturerID,
		batch.ProductType,
		batch.BatchSize,
		batch.UnitOfMeasure,
		batch.OriginCountry,
		batch.DestinationCountry,
		batch.USFStatus,
		batch.BlockchainHash,
		batch.MinTemp,
		batch.MaxTemp,
		batch.TokenURI,
		batch.Certificates,
		batch.TemplateID,
		batch.PartnerID,
		batch.MarketingStory,
		batch.PartnerRedirectURL,
		batch.Ingredients,
		batch.Nutrition,
	).Scan(&id)

	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to insert batch: %w", err)
	}

	return id, nil
}

	func (r *BatchRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Batch, error) {
	query := `
		SELECT 
			id, manufacturer_id, product_type, batch_size, unit_of_measure,
			origin_country, destination_country, usf_status, blockchain_hash, 
			created_at, min_temp, max_temp, token_uri, certificates_ipfs, template_id, partner_id,
			marketing_story, partner_redirect_url, ingredients, nutrition
		FROM product_batches
		WHERE id = $1
	`

	var batch domain.Batch
	err := r.db.QueryRow(ctx, query, id).Scan(
		&batch.ID,
		&batch.ManufacturerID,
		&batch.ProductType,
		&batch.BatchSize,
		&batch.UnitOfMeasure,
		&batch.OriginCountry,
		&batch.DestinationCountry,
		&batch.USFStatus,
		&batch.BlockchainHash,
		&batch.CreatedAt,
		&batch.MinTemp,
		&batch.MaxTemp,
		&batch.TokenURI,
		&batch.Certificates,
		&batch.TemplateID,
		&batch.PartnerID,
		&batch.MarketingStory,
		&batch.PartnerRedirectURL,
		&batch.Ingredients,
		&batch.Nutrition,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get batch: %w", err)
	}

	return &batch, nil
}

func (r *BatchRepository) UpdateBlockchainHash(ctx context.Context, id uuid.UUID, hash string) error {
	query := `
		UPDATE product_batches
		SET blockchain_hash = $1
		WHERE id = $2
	`

	_, err := r.db.Exec(ctx, query, hash, id)
	return err
}

func (r *BatchRepository) ReportViolation(ctx context.Context, id uuid.UUID, details string) error {
	query := `
		UPDATE product_batches
		SET usf_status = 'VIOLATED'
		WHERE id = $1
	`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *BatchRepository) Reset(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE product_batches
		SET blockchain_hash = NULL, usf_status = 'PENDING'
		WHERE id = $1
	`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *BatchRepository) ListAll(ctx context.Context, companyID string, role string) ([]domain.Batch, error) {
	var query string
	var args []interface{}

	if role == "ADMIN" {
		query = `
			SELECT 
				id, manufacturer_id, product_type, batch_size, unit_of_measure,
				origin_country, destination_country, usf_status, blockchain_hash, 
				created_at, min_temp, max_temp, token_uri, certificates_ipfs, template_id, partner_id,
				marketing_story, partner_redirect_url, ingredients, nutrition
			FROM product_batches
			ORDER BY created_at DESC
		`
	} else if role == "MANUFACTURER" {
		query = `
			SELECT 
				id, manufacturer_id, product_type, batch_size, unit_of_measure,
				origin_country, destination_country, usf_status, blockchain_hash, 
				created_at, min_temp, max_temp, token_uri, certificates_ipfs, template_id, partner_id,
				marketing_story, partner_redirect_url, ingredients, nutrition
			FROM product_batches
			WHERE manufacturer_id = $1
			ORDER BY created_at DESC
		`
		args = append(args, companyID)
	} else {
		// Logistics or Retailer see batches where they are the assigned partner
		query = `
			SELECT 
				id, manufacturer_id, product_type, batch_size, unit_of_measure,
				origin_country, destination_country, usf_status, blockchain_hash, 
				created_at, min_temp, max_temp, token_uri, certificates_ipfs, template_id, partner_id,
				marketing_story, partner_redirect_url, ingredients, nutrition
			FROM product_batches
			WHERE partner_id = $1
			ORDER BY created_at DESC
		`
		args = append(args, companyID)
	}

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list batches: %w", err)
	}
	defer rows.Close()

	var batches []domain.Batch
	for rows.Next() {
		var batch domain.Batch
		err := rows.Scan(
			&batch.ID,
			&batch.ManufacturerID,
			&batch.ProductType,
			&batch.BatchSize,
			&batch.UnitOfMeasure,
			&batch.OriginCountry,
			&batch.DestinationCountry,
			&batch.USFStatus,
			&batch.BlockchainHash,
			&batch.CreatedAt,
			&batch.MinTemp,
			&batch.MaxTemp,
			&batch.TokenURI,
			&batch.Certificates,
			&batch.TemplateID,
			&batch.PartnerID,
			&batch.MarketingStory,
			&batch.PartnerRedirectURL,
			&batch.Ingredients,
			&batch.Nutrition,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan batch: %w", err)
		}
		batches = append(batches, batch)
	}

	return batches, nil
}

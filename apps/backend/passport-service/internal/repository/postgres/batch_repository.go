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
		INSERT INTO product_batches (manufacturer_id, product_type, batch_size, usf_status, blockchain_hash, min_temp, max_temp)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`

	var id uuid.UUID
	err := r.db.QueryRow(ctx, query,
		batch.ManufacturerID,
		batch.ProductType,
		batch.BatchSize,
		batch.USFStatus,
		batch.BlockchainHash,
		batch.MinTemp,
		batch.MaxTemp,
	).Scan(&id)

	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to insert batch: %w", err)
	}

	return id, nil
}

	func (r *BatchRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Batch, error) {
	query := `
		SELECT id, manufacturer_id, product_type, batch_size, usf_status, blockchain_hash, created_at, min_temp, max_temp
		FROM product_batches
		WHERE id = $1
	`

	var batch domain.Batch
	err := r.db.QueryRow(ctx, query, id).Scan(
		&batch.ID,
		&batch.ManufacturerID,
		&batch.ProductType,
		&batch.BatchSize,
		&batch.USFStatus,
		&batch.BlockchainHash,
		&batch.CreatedAt,
		&batch.MinTemp,
		&batch.MaxTemp,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get batch: %w", err)
	}

	return &batch, nil
}

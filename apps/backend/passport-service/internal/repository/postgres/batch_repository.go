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
		INSERT INTO product_batches (manufacturer_id, product_type, batch_size, usf_status, blockchain_hash)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	var id uuid.UUID
	err := r.db.QueryRow(ctx, query,
		batch.ManufacturerID,
		batch.ProductType,
		batch.BatchSize,
		batch.USFStatus,
		batch.BlockchainHash,
	).Scan(&id)

	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to insert batch: %w", err)
	}

	return id, nil
}

package service

import (
	"context"
	"errors"
	"github.com/global-foodtech-bridge/passport-service/internal/domain"
	"github.com/global-foodtech-bridge/passport-service/internal/repository/postgres"
	"github.com/google/uuid"
)

type BatchService struct {
	repo *postgres.BatchRepository
}

func NewBatchService(repo *postgres.BatchRepository) *BatchService {
	return &BatchService{repo: repo}
}

func (s *BatchService) CreateBatch(ctx context.Context, req domain.CreateBatchRequest) (*domain.CreateBatchResponse, error) {
	// 1. Validation
	if req.BatchSize <= 0 {
		return nil, errors.New("batch_size must be positive")
	}
	if req.ManufacturerID == "" {
		return nil, errors.New("manufacturer_id is required")
	}
	if req.ProductType == "" {
		return nil, errors.New("product_type is required")
	}

	manufacturerUUID, err := uuid.Parse(req.ManufacturerID)
	if err != nil {
		return nil, errors.New("invalid manufacturer_id format")
	}

	// 2. Mapping
	batch := &domain.Batch{
		ManufacturerID: manufacturerUUID,
		ProductType:    req.ProductType,
		BatchSize:      req.BatchSize,
		USFStatus:      domain.StatusPending,
		BlockchainHash: nil,
	}

	// 3. Persistence
	id, err := s.repo.Create(ctx, batch)
	if err != nil {
		return nil, err
	}

	return &domain.CreateBatchResponse{
		BatchID: id,
		Status:  "created",
	}, nil
}

func (s *BatchService) GetBatch(ctx context.Context, idStr string) (*domain.Batch, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, errors.New("invalid batch id")
	}

	return s.repo.GetByID(ctx, id)
}

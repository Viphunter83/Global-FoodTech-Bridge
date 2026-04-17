package service

import (
	"context"
	"errors"
	"github.com/global-foodtech-bridge/passport-service/internal/domain"
	"github.com/global-foodtech-bridge/passport-service/internal/repository/postgres"
	"github.com/google/uuid"
)

type SLARule struct {
	MinTemp float64
	MaxTemp float64
}

var SLARegistry = map[string]SLARule{
	"PHO_BO_SOUP": {MinTemp: -25.0, MaxTemp: -18.0},
	"MANGO_SHAKE": {MinTemp: 2.0, MaxTemp: 6.0},
	"DRIED_MANGO": {MinTemp: 10.0, MaxTemp: 25.0}, // Universal addition
}

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
	if req.OriginCountry == "" {
		return nil, errors.New("origin_country is required for international trade")
	}
	if req.DestinationCountry == "" {
		return nil, errors.New("destination_country is required for international trade")
	}

	manufacturerUUID, err := uuid.Parse(req.ManufacturerID)
	if err != nil {
		return nil, errors.New("invalid manufacturer_id format")
	}

	// 2. Mapping & SLA Rules
	rule, exists := SLARegistry[req.ProductType]
	if !exists {
		// Default safe ambient/dry cargo limits if unknown
		rule = SLARule{MinTemp: 0.0, MaxTemp: 30.0}
	}

	// 3. Entity Creation
	batch := &domain.Batch{
		ManufacturerID:     manufacturerUUID,
		ProductType:        req.ProductType,
		BatchSize:          req.BatchSize,
		UnitOfMeasure:      req.UnitOfMeasure,
		OriginCountry:      req.OriginCountry,
		DestinationCountry: req.DestinationCountry,
		USFStatus:          domain.StatusPending,
		BlockchainHash:     nil,
		MinTemp:            &rule.MinTemp,
		MaxTemp:            &rule.MaxTemp,
		TokenURI:           &req.TokenURI,
		CertificatesIPFS:   req.CertificatesIPFS,
	}

	if req.TemplateID != "" {
		templateUUID, err := uuid.Parse(req.TemplateID)
		if err == nil {
			batch.TemplateID = &templateUUID
		}
	}

	if batch.UnitOfMeasure == "" {
		batch.UnitOfMeasure = "kg" // Default
	}
	if batch.OriginCountry == "" {
		batch.OriginCountry = "Unknown"
	}
	if batch.DestinationCountry == "" {
		batch.DestinationCountry = "Global"
	}
	if batch.CertificatesIPFS == nil {
		batch.CertificatesIPFS = []string{}
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

func (s *BatchService) UpdateBlockchainHash(ctx context.Context, idStr string, hash string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return errors.New("invalid batch id")
	}

	return s.repo.UpdateBlockchainHash(ctx, id, hash)
}

package service

import (
	"context"
	"errors"
	"github.com/global-foodtech-bridge/passport-service/internal/domain"
	"github.com/global-foodtech-bridge/passport-service/internal/repository/postgres"
	"github.com/google/uuid"
	"log"
	"fmt"
)

type BatchService struct {
	repo           *postgres.BatchRepository
	complianceRepo *postgres.ComplianceRepository
}

func NewBatchService(repo *postgres.BatchRepository, complianceRepo *postgres.ComplianceRepository) *BatchService {
	return &BatchService{
		repo:           repo,
		complianceRepo: complianceRepo,
	}
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

	// 2. Dynamic Compliance & SLA Rules
	rules, err := s.complianceRepo.GetRules(ctx, req.DestinationCountry, req.ProductType)
	if err != nil {
		log.Printf("Warning: failed to fetch compliance rules: %v", err)
	}

	var minTemp, maxTemp *float64
	for _, rule := range rules {
		if rule.RequirementType == "SLA_TEMP" {
			minTemp = rule.MinValue
			maxTemp = rule.MaxValue
		}
		
		// 3. Mandatory Document Check
		if rule.RequirementType == "CERTIFICATE" && rule.IsMandatory {
			found := false
			for _, cert := range req.Certificates {
				if cert.Type == rule.RequirementName {
					found = true
					break
				}
			}
			if !found {
				return nil, fmt.Errorf("mandatory certificate missing for %s: %s", req.DestinationCountry, rule.RequirementName)
			}
		}
	}

	// 4. Entity Construction
	batch := &domain.Batch{
		ManufacturerID:     manufacturerUUID,
		ProductType:        req.ProductType,
		BatchSize:          req.BatchSize,
		UnitOfMeasure:      req.UnitOfMeasure,
		OriginCountry:      req.OriginCountry,
		DestinationCountry: req.DestinationCountry,
		USFStatus:          domain.StatusPending,
		BlockchainHash:     nil,
		MinTemp:            minTemp,
		MaxTemp:            maxTemp,
		TokenURI:           &req.TokenURI,
		Certificates:       req.Certificates,
		MarketingStory:     req.MarketingStory,
		PartnerRedirectURL: &req.PartnerRedirectURL,
		Ingredients:        req.Ingredients,
		Nutrition:          req.Nutrition,
	}

	if req.TemplateID != "" {
		templateUUID, err := uuid.Parse(req.TemplateID)
		if err == nil {
			batch.TemplateID = &templateUUID
		}
	}

	if req.PartnerID != "" {
		partnerUUID, err := uuid.Parse(req.PartnerID)
		if err == nil {
			batch.PartnerID = &partnerUUID
		}
	}

	if batch.UnitOfMeasure == "" {
		batch.UnitOfMeasure = "kg" // Default
	}
	if batch.Certificates == nil {
		batch.Certificates = []domain.BatchCertificate{}
	}

	// 5. Persistence
	id, err := s.repo.Create(ctx, batch)
	if err != nil {
		return nil, err
	}

	return &domain.CreateBatchResponse{
		BatchID: id,
		Status:  "created",
	}, nil
}

func (s *BatchService) GetPartner(ctx context.Context, id string) (*domain.Partner, error) {
	return s.complianceRepo.GetPartner(ctx, id)
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

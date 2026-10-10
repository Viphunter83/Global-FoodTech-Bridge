package service

import (
	"context"
	"errors"
	"github.com/global-foodtech-bridge/passport-service/internal/domain"
	"github.com/global-foodtech-bridge/passport-service/internal/repository/postgres"
	"github.com/google/uuid"
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
		return nil, ValidationError("batch_size must be positive")
	}
	if req.ManufacturerID == "" {
		return nil, ValidationError("manufacturer_id is required")
	}
	if req.ProductType == "" {
		return nil, ValidationError("product_type is required")
	}
	if req.OriginCountry == "" {
		return nil, ValidationError("origin_country is required for international trade")
	}
	if req.DestinationCountry == "" {
		return nil, ValidationError("destination_country is required for international trade")
	}

	manufacturerUUID, err := uuid.Parse(req.ManufacturerID)
	if err != nil {
		return nil, ValidationError("invalid manufacturer_id format")
	}

	// 2. Dynamic Compliance & SLA Rules
	rules, err := s.complianceRepo.GetRules(ctx, req.DestinationCountry, req.ProductType)
	if err != nil {
		// Fail closed: without the rules we cannot check mandatory certificates
		return nil, fmt.Errorf("failed to fetch compliance rules: %w", err)
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
				return nil, ValidationError(fmt.Sprintf("mandatory certificate missing for %s: %s", req.DestinationCountry, rule.RequirementName))
			}
		}
	}

	// Explicit limits from the request take precedence over rule defaults
	if req.MinTemp != nil || req.MaxTemp != nil {
		if err := validateTempRange(req.MinTemp, req.MaxTemp); err != nil {
			return nil, err
		}
		minTemp, maxTemp = req.MinTemp, req.MaxTemp
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
		SensorIDs:          req.SensorIDs,
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
		return fmt.Errorf("invalid uuid: %w", err)
	}
	return s.repo.UpdateBlockchainHash(ctx, id, hash)
}

func (s *BatchService) UpdateIOTConfig(ctx context.Context, idStr string, sensorIDs []string, startTracking bool, minTemp, maxTemp *float64) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return ValidationError("invalid batch id")
	}
	if minTemp != nil || maxTemp != nil {
		if err := validateTempRange(minTemp, maxTemp); err != nil {
			return err
		}
	}
	return s.repo.UpdateIOTConfig(ctx, id, sensorIDs, startTracking, minTemp, maxTemp)
}

// validateTempRange checks an SLA temperature window; either bound may be open.
func validateTempRange(minTemp, maxTemp *float64) error {
	for _, v := range []*float64{minTemp, maxTemp} {
		if v != nil && (*v < -100 || *v > 100) {
			return ValidationError("temperature limits must be between -100 and 100 °C")
		}
	}
	if minTemp != nil && maxTemp != nil && *minTemp >= *maxTemp {
		return ValidationError("min_temp must be lower than max_temp")
	}
	return nil
}

func (s *BatchService) ReportViolation(ctx context.Context, idStr string, details string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return fmt.Errorf("invalid uuid: %w", err)
	}
	return s.repo.ReportViolation(ctx, id, details)
}

func (s *BatchService) ListAllBatches(ctx context.Context, companyID string, role string) ([]domain.Batch, error) {
	return s.repo.ListAll(ctx, companyID, role)
}

func (s *BatchService) ResetBatch(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return errors.New("invalid batch id")
	}

	return s.repo.Reset(ctx, id)
}

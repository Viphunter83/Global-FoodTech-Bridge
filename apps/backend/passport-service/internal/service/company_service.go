package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/global-foodtech-bridge/passport-service/internal/domain"
	"github.com/global-foodtech-bridge/passport-service/internal/repository/postgres"
	"github.com/google/uuid"
	"os"
)

type CompanyService struct {
	repo          *postgres.CompanyRepository
	walletService *WalletService
}

func NewCompanyService(repo *postgres.CompanyRepository, ws *WalletService) *CompanyService {
	return &CompanyService{
		repo:          repo,
		walletService: ws,
	}
}

func (s *CompanyService) CreateCompany(ctx context.Context, req domain.CreateCompanyRequest) (*domain.Company, error) {
	// 1. Generate Wallet
	addr, privKey, err := s.walletService.GenerateWallet()
	if err != nil {
		return nil, fmt.Errorf("wallet gen failed: %w", err)
	}

	// 2. Encrypt Key
	encKey, err := s.walletService.EncryptKey(privKey)
	if err != nil {
		return nil, fmt.Errorf("key encryption failed: %w", err)
	}

	// 3. Create Company Model
	company := &domain.Company{
		ID:                  uuid.New(),
		Name:                req.Name,
		Type:                req.Type,
		GLNNumber:           req.GLNNumber,
		VATNumber:           req.VATNumber,
		WalletAddress:       addr,
		EncryptedPrivateKey: encKey,
		ProductionLocation:  req.ProductionLocation,
		IsActive:            true,
		CreatedAt:           time.Now(),
		UpdatedAt:           time.Now(),
	}

	// 4. Save to DB
	if err := s.repo.Create(ctx, company); err != nil {
		return nil, err
	}

	return company, nil
}

func (s *CompanyService) GetCompany(ctx context.Context, id uuid.UUID) (*domain.Company, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *CompanyService) GetAllCompanies(ctx context.Context) ([]domain.Company, error) {
	return s.repo.GetAll(ctx)
}

func (s *CompanyService) ApproveCompany(ctx context.Context, id uuid.UUID) error {
	// 1. Get Company
	company, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("company not found: %w", err)
	}

	// 2. Call Blockchain Service to Grant Role
	baseURL := os.Getenv("BLOCKCHAIN_SERVICE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:3000"
	}
	blockchainURL := fmt.Sprintf("%s/api/v1/admin/grant-role", baseURL)

	payload := map[string]string{
		"role":          string(company.Type),
		"targetAddress": company.WalletAddress,
	}
	jsonBody, _ := json.Marshal(payload)

	req, err := http.NewRequestWithContext(ctx, "POST", blockchainURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to call blockchain service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("blockchain service returned error: %s", resp.Status)
	}

	// 3. Update DB status
	if err := s.repo.UpdateStatus(ctx, id, true); err != nil {
		return fmt.Errorf("failed to update company status in DB: %w", err)
	}

	return nil
}

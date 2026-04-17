package service

import (
	"context"
	"errors"

	"github.com/global-foodtech-bridge/passport-service/internal/domain"
	"github.com/global-foodtech-bridge/passport-service/internal/repository/postgres"
	"github.com/google/uuid"
)

type TemplateService struct {
	repo *postgres.TemplateRepository
}

func NewTemplateService(repo *postgres.TemplateRepository) *TemplateService {
	return &TemplateService{repo: repo}
}

func (s *TemplateService) ListTemplates(ctx context.Context) ([]domain.Template, error) {
	return s.repo.List(ctx)
}

func (s *TemplateService) GetTemplate(ctx context.Context, idStr string) (*domain.Template, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, errors.New("invalid template id")
	}

	return s.repo.GetByID(ctx, id)
}

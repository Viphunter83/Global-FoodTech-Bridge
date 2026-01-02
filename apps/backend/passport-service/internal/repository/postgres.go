package repository

import (
	"github.com/global-foodtech-bridge/passport-service/internal/domain"
	"gorm.io/gorm"
)

type BatchRepository interface {
	Create(batch *domain.ProductBatch) error
}

type batchRepository struct {
	db *gorm.DB
}

func NewBatchRepository(db *gorm.DB) BatchRepository {
	return &batchRepository{db: db}
}

func (r *batchRepository) Create(batch *domain.ProductBatch) error {
	return r.db.Create(batch).Error
}

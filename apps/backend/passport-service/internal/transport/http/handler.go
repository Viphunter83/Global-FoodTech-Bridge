package http

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/global-foodtech-bridge/passport-service/internal/domain"
	"github.com/global-foodtech-bridge/passport-service/internal/service"
)

type Handler struct {
	service *service.BatchService
}

func NewHandler(service *service.BatchService) *Handler {
	return &Handler{service: service}
}

func (h *Handler) InitRoutes() *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/batches", h.createBatch)
		r.Get("/batches/{id}", h.getBatch)
	})

	return r
}

func (h *Handler) createBatch(w http.ResponseWriter, r *http.Request) {
	var req domain.CreateBatchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	res, err := h.service.CreateBatch(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError) // In real app, distinguish 400 vs 500 errors
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)

}

func (h *Handler) getBatch(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing batch id", http.StatusBadRequest)
		return
	}

	batch, err := h.service.GetBatch(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(batch)
}

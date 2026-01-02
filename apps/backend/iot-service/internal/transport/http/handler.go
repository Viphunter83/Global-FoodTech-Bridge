package http

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/global-foodtech-bridge/iot-service/internal/domain"
	"github.com/global-foodtech-bridge/iot-service/internal/service"
)

type Handler struct {
	service *service.TelemetryService
}

func NewHandler(service *service.TelemetryService) *Handler {
	return &Handler{service: service}
}

func (h *Handler) InitRoutes() *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/telemetry", h.ingestTelemetry)
		r.Get("/telemetry/{batchId}", h.getReadings)
	})

	return r
}

func (h *Handler) ingestTelemetry(w http.ResponseWriter, r *http.Request) {
	var req domain.IngestTelemetryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.service.IngestData(r.Context(), req); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) getReadings(w http.ResponseWriter, r *http.Request) {
	batchID := chi.URLParam(r, "batchId")
	if batchID == "" {
		http.Error(w, "missing batch_id", http.StatusBadRequest)
		return
	}

	readings, err := h.service.GetReadings(r.Context(), batchID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(readings)
}

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
		// Protected Routes (Logistics or Manufacturer)
		r.Group(func(r chi.Router) {
			r.Use(h.RoleMiddleware("LOGISTICS", "MANUFACTURER"))
			r.Post("/telemetry", h.ingestTelemetry)
		})

		// Public Routes
		r.Get("/telemetry/{batchId}", h.getReadings)
		r.Get("/telemetry/{batchId}/alerts", h.getAlerts)
	})

	return r
}

func (h *Handler) RoleMiddleware(allowedRoles ...string) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role := r.Header.Get("X-User-Role")
			
			allowed := false
			for _, allowedRole := range allowedRoles {
				if role == allowedRole {
					allowed = true
					break
				}
			}

			if !allowed {
				http.Error(w, "Forbidden: Insufficient Role", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
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

func (h *Handler) getAlerts(w http.ResponseWriter, r *http.Request) {
	batchID := chi.URLParam(r, "batchId")
	if batchID == "" {
		http.Error(w, "missing batch_id", http.StatusBadRequest)
		return
	}

	alerts, err := h.service.GetAlerts(r.Context(), batchID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(alerts)
}

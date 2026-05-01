package http

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

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
	
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	r.Route("/api/v1", func(r chi.Router) {
		r.Use(h.AuthMiddleware)

		// Protected Routes (Logistics or Manufacturer)
		r.Group(func(r chi.Router) {
			r.Use(h.RoleMiddleware("LOGISTICS", "MANUFACTURER"))
			r.Post("/telemetry", h.ingestTelemetry)
		})

		// Public Routes (now protected by API Key)
		r.Get("/telemetry/{batchId}", h.getReadings)
		r.Get("/telemetry/{batchId}/alerts", h.getAlerts)
		r.Post("/demo/reset/{batchId}", h.resetBatch)
	})

	return r
}

func (h *Handler) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		apiKey := r.Header.Get("x-api-key")
		expectedKey := os.Getenv("INTERNAL_API_KEY")

		if expectedKey != "" && apiKey != expectedKey {
			log.Printf("[AUTH] Denied access to %s %s from %s. Invalid API Key.", r.Method, r.URL.Path, r.RemoteAddr)
			http.Error(w, "Unauthorized: Invalid API Key", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (h *Handler) RoleMiddleware(allowedRoles ...string) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Role check only (API Key is handled by AuthMiddleware)
			role := r.Header.Get("X-User-Role")
			if role == "" {
				log.Printf("[ROLE] Access denied to %s %s: No X-User-Role header provided", r.Method, r.URL.Path)
				http.Error(w, "Forbidden: Role header required", http.StatusForbidden)
				return
			}
			
			allowed := false
			for _, allowedRole := range allowedRoles {
				if role == allowedRole {
					allowed = true
					break
				}
			}

			if !allowed {
				log.Printf("[ROLE] Access denied to %s %s: Required one of %v, but got %s", r.Method, r.URL.Path, allowedRoles, role)
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

func (h *Handler) resetBatch(w http.ResponseWriter, r *http.Request) {
	batchID := chi.URLParam(r, "batchId")
	if batchID == "" {
		http.Error(w, "missing batch_id", http.StatusBadRequest)
		return
	}

	if err := h.service.ResetBatch(r.Context(), batchID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"success"}`))
}

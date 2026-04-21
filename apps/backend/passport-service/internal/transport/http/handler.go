package http

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/global-foodtech-bridge/passport-service/internal/domain"
	"github.com/global-foodtech-bridge/passport-service/internal/service"
	"github.com/google/uuid"
	"log"
	"os"
)

type Handler struct {
	service         *service.BatchService
	companyService  *service.CompanyService
	templateService *service.TemplateService
}

func NewHandler(service *service.BatchService, companyService *service.CompanyService, templateService *service.TemplateService) *Handler {
	return &Handler{
		service:         service,
		companyService:  companyService,
		templateService: templateService,
	}
}

func (h *Handler) InitRoutes() *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Root Health Check (critical for Railway)
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Passport Service Running"))
	})
	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	r.Route("/api/v1", func(r chi.Router) {
		// Public Routes (Moving these OUT of the AuthMiddleware group below)
		r.Get("/batches/{id}", h.getBatch)
		r.Get("/partners/{id}", h.getPartner)
		r.Get("/templates", h.listTemplates)
		r.Get("/templates/{id}", h.getTemplate)
		r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("ok"))
		})

		// Protected Routes
		r.Group(func(r chi.Router) {
			r.Use(h.AuthMiddleware)

			r.Group(func(r chi.Router) {
				r.Use(h.RoleMiddleware("MANUFACTURER", "ADMIN"))
				r.Post("/batches", h.createBatch)
			})
			
			r.Patch("/batches/{id}/blockchain", h.updateBlockchain)

			// Admin Routes (protected by ADMIN role)
			r.Group(func(r chi.Router) {
				r.Use(h.RoleMiddleware("ADMIN"))
				r.Post("/admin/companies", h.createCompany)
				r.Get("/admin/companies", h.listCompanies)
				r.Patch("/admin/companies/{id}/approve", h.approveCompany)
				
				// Admin Templates
				r.Post("/admin/templates", h.createTemplate)
				r.Put("/admin/templates/{id}", h.updateTemplate)
				r.Delete("/admin/templates/{id}", h.deleteTemplate)
			})
		})
	})

	return r
}

func (h *Handler) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		apiKey := r.Header.Get("x-api-key")
		expectedKey := os.Getenv("INTERNAL_API_KEY")

		if expectedKey == "" {
			log.Print("[AUTH] WARNING: INTERNAL_API_KEY not set in environment. Backend is vulnerable.")
		}

		if expectedKey != "" && apiKey != expectedKey {
			keyLen := len(apiKey)
			maskedKey := "EMPTY"
			if keyLen > 4 {
				maskedKey = apiKey[:4] + "****"
			} else if keyLen > 0 {
				maskedKey = "****"
			}
			
			log.Printf("[AUTH] Denied access to %s %s from %s. Invalid key: %s", r.Method, r.URL.Path, r.RemoteAddr, maskedKey)
			http.Error(w, "Unauthorized: Invalid API Key", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (h *Handler) RoleMiddleware(allowedRoles ...string) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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

func (h *Handler) getPartner(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing partner id", http.StatusBadRequest)
		return
	}

	partner, err := h.service.GetPartner(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(partner)
}

func (h *Handler) updateBlockchain(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing batch id", http.StatusBadRequest)
		return
	}

	var req domain.UpdateBlockchainRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.service.UpdateBlockchainHash(r.Context(), id, req.BlockchainHash); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

func (h *Handler) createCompany(w http.ResponseWriter, r *http.Request) {
	var req domain.CreateCompanyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	res, err := h.companyService.CreateCompany(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}

func (h *Handler) listCompanies(w http.ResponseWriter, r *http.Request) {
	companies, err := h.companyService.GetAllCompanies(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(companies)
}

func (h *Handler) approveCompany(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	if err := h.companyService.ApproveCompany(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "approved"})
}

func (h *Handler) listTemplates(w http.ResponseWriter, r *http.Request) {
	templates, err := h.templateService.ListTemplates(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(templates)
}

func (h *Handler) getTemplate(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing template id", http.StatusBadRequest)
		return
	}

	template, err := h.templateService.GetTemplate(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(template)
}

func (h *Handler) createTemplate(w http.ResponseWriter, r *http.Request) {
	var t domain.Template
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	res, err := h.templateService.CreateTemplate(r.Context(), t)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}

func (h *Handler) updateTemplate(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing template id", http.StatusBadRequest)
		return
	}

	var t domain.Template
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	templateUUID, err := uuid.Parse(id)
	if err != nil {
		http.Error(w, "invalid uuid", http.StatusBadRequest)
		return
	}
	t.ID = templateUUID

	res, err := h.templateService.UpdateTemplate(r.Context(), t)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func (h *Handler) deleteTemplate(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing template id", http.StatusBadRequest)
		return
	}

	if err := h.templateService.DeleteTemplate(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

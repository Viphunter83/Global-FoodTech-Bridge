package http

import (
	"crypto/sha256"
	"crypto/subtle"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

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
	jwtVerifier     *JWTVerifier
}

func NewHandler(service *service.BatchService, companyService *service.CompanyService, templateService *service.TemplateService, jwtVerifier *JWTVerifier) *Handler {
	return &Handler{
		service:         service,
		companyService:  companyService,
		templateService: templateService,
		jwtVerifier:     jwtVerifier,
	}
}

func (h *Handler) InitRoutes() *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RealIP)
	r.Use(SecurityHeadersMiddleware)
	r.Use(NewRateLimiter(100, time.Minute).Middleware) // 100 req/min per IP
	r.Use(h.jwtVerifier.Middleware)                    // Validate Firebase JWT if present

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
		r.Use(h.AuthMiddleware)

		// Read-only routes (protected by API Key)
		r.Get("/batches/{id}", h.getBatch)
		r.Get("/partners/{id}", h.getPartner)
		r.Get("/templates", h.listTemplates)
		r.Get("/templates/{id}", h.getTemplate)
		
		r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("ok"))
		})

		// Protected Routes with Role Checks
		r.Group(func(r chi.Router) {
			r.Group(func(r chi.Router) {
				r.Use(h.RoleMiddleware("MANUFACTURER", "ADMIN"))
				r.Post("/batches", h.createBatch)
			})
			
			r.Patch("/batches/{id}/blockchain", h.updateBlockchain)
			r.Patch("/batches/{id}/sensor", h.updateSensor)
			r.Post("/batches/{id}/violation", h.reportViolation)

			// Admin Routes (protected by ADMIN role)
			r.Group(func(r chi.Router) {
				r.Use(h.RoleMiddleware("ADMIN"))
				r.Post("/admin/companies", h.createCompany)
				r.Get("/admin/companies", h.listCompanies)
				r.Patch("/admin/companies/{id}/approve", h.approveCompany)
				
				// Admin Batches
				r.Get("/admin/batches", h.listBatches)
				
				// Admin Templates
				r.Post("/admin/templates", h.createTemplate)
				r.Put("/admin/templates/{id}", h.updateTemplate)
				r.Delete("/admin/templates/{id}", h.deleteTemplate)

				// Demo routes (ADMIN only in production)
				r.Post("/demo/reset/{id}", h.resetBatch)
			})
		})
	})

	return r
}

// secureCompare performs a constant-time comparison of two strings
// to prevent timing-based side-channel attacks.
func secureCompare(a, b string) bool {
	hashedA := sha256.Sum256([]byte(a))
	hashedB := sha256.Sum256([]byte(b))
	return subtle.ConstantTimeCompare(hashedA[:], hashedB[:]) == 1
}

func (h *Handler) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		apiKey := r.Header.Get("x-api-key")
		expectedKey := os.Getenv("INTERNAL_API_KEY")

		// SECURITY: Fail closed — if no key is configured, deny all requests
		if expectedKey == "" {
			log.Print("[AUTH] CRITICAL: INTERNAL_API_KEY not set. Denying all requests.")
			http.Error(w, "Service misconfigured", http.StatusServiceUnavailable)
			return
		}

		if !secureCompare(apiKey, expectedKey) {
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

		// Bypass role checks for internal service calls by injecting ADMIN role
		if r.Header.Get("X-Verified-Role") == "" {
			r.Header.Set("X-Verified-Role", "ADMIN")
		}

		next.ServeHTTP(w, r)
	})
}

func (h *Handler) RoleMiddleware(allowedRoles ...string) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role := r.Header.Get("X-Verified-Role")
			
			if role == "" {
				log.Printf("[ROLE] Access denied to %s %s: No verified role found in token", r.Method, r.URL.Path)
				msg := fmt.Sprintf("Forbidden: Role header required. Debug: X-Verified-Role=%s, x-api-key-len=%d", 
					r.Header.Get("X-Verified-Role"), len(r.Header.Get("x-api-key")))
				http.Error(w, msg, http.StatusForbidden)
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

	companyID := r.Header.Get("X-Verified-Company-ID")
	role := r.Header.Get("X-Verified-Role")

	batch, err := h.service.GetBatch(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	// SECURITY: Ensure user belongs to the company that owns the batch, or is an ADMIN
	// If role is empty (guest/public request), we allow reading the batch details.
	if role != "" && role != "ADMIN" && batch.ManufacturerID.String() != companyID {
		log.Printf("[AUTH] Denied access to batch %s for company %s (user company: %s, role: %s)", id, batch.ManufacturerID, companyID, role)
		http.Error(w, "Forbidden: You do not have access to this batch", http.StatusForbidden)
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

	companyID := r.Header.Get("X-Verified-Company-ID")
	role := r.Header.Get("X-Verified-Role")

	// First verify ownership
	batch, err := h.service.GetBatch(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if role != "ADMIN" && batch.ManufacturerID.String() != companyID {
		log.Printf("[AUTH] Denied updateBlockchain for batch %s: company mismatch", id)
		http.Error(w, "Forbidden: Access denied", http.StatusForbidden)
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

func (h *Handler) updateSensor(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing batch id", http.StatusBadRequest)
		return
	}

	companyID := r.Header.Get("X-Verified-Company-ID")
	role := r.Header.Get("X-Verified-Role")

	// Verify ownership
	batch, err := h.service.GetBatch(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if role != "ADMIN" && batch.ManufacturerID.String() != companyID {
		log.Printf("[AUTH] Denied updateSensor for batch %s: company mismatch", id)
		http.Error(w, "Forbidden: Access denied", http.StatusForbidden)
		return
	}

	var req struct {
		SensorIDs     []string `json:"sensor_ids"`
		StartTracking bool     `json:"start_tracking"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.service.UpdateIOTConfig(r.Context(), id, req.SensorIDs, req.StartTracking); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	status := "sensor_linked"
	if req.StartTracking {
		status = "monitoring_activated"
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": status})
}

func (h *Handler) reportViolation(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing batch id", http.StatusBadRequest)
		return
	}

	companyID := r.Header.Get("X-Verified-Company-ID")
	role := r.Header.Get("X-Verified-Role")

	// Verify ownership
	batch, err := h.service.GetBatch(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if role != "ADMIN" && batch.ManufacturerID.String() != companyID {
		log.Printf("[AUTH] Denied reportViolation for batch %s: company mismatch", id)
		http.Error(w, "Forbidden: Access denied", http.StatusForbidden)
		return
	}

	var req struct {
		Details string `json:"details"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.service.ReportViolation(r.Context(), id, req.Details); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "reported"})
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

func (h *Handler) listBatches(w http.ResponseWriter, r *http.Request) {
	companyID := r.Header.Get("X-Verified-Company-ID")
	role := r.Header.Get("X-Verified-Role")

	batches, err := h.service.ListAllBatches(r.Context(), companyID, role)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(batches)
}

func (h *Handler) resetBatch(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing batch id", http.StatusBadRequest)
		return
	}

	if err := h.service.ResetBatch(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// =============================================================================
// Security Middleware
// =============================================================================

// SecurityHeadersMiddleware adds security-related HTTP headers to every response.
func SecurityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		next.ServeHTTP(w, r)
	})
}

// =============================================================================
// Rate Limiter (in-memory, per-IP)
// =============================================================================

// RateLimiter implements a simple sliding-window rate limiter per IP address.
type RateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	limit    int
	window   time.Duration
}

type visitor struct {
	count    int
	resetAt  time.Time
}

// NewRateLimiter creates a new rate limiter with the given limit per time window.
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*visitor),
		limit:    limit,
		window:   window,
	}
	// Background cleanup every 5 minutes
	go func() {
		for {
			time.Sleep(5 * time.Minute)
			rl.cleanup()
		}
	}()
	return rl
}

func (rl *RateLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	now := time.Now()
	for ip, v := range rl.visitors {
		if now.After(v.resetAt) {
			delete(rl.visitors, ip)
		}
	}
}

// Middleware returns a chi-compatible middleware that enforces rate limiting.
func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr

		rl.mu.Lock()
		v, exists := rl.visitors[ip]
		if !exists || time.Now().After(v.resetAt) {
			rl.visitors[ip] = &visitor{count: 1, resetAt: time.Now().Add(rl.window)}
			rl.mu.Unlock()
			next.ServeHTTP(w, r)
			return
		}

		v.count++
		if v.count > rl.limit {
			rl.mu.Unlock()
			log.Printf("[RATE-LIMIT] IP %s exceeded %d requests in %s", ip, rl.limit, rl.window)
			http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
			return
		}
		rl.mu.Unlock()

		next.ServeHTTP(w, r)
	})
}

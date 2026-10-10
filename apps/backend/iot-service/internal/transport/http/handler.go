package http

import (
	"crypto/sha256"
	"crypto/subtle"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/global-foodtech-bridge/iot-service/internal/domain"
	"github.com/global-foodtech-bridge/iot-service/internal/service"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type Handler struct {
	service     *service.TelemetryService
	jwtVerifier *JWTVerifier
}

func NewHandler(service *service.TelemetryService, jwtVerifier *JWTVerifier) *Handler {
	return &Handler{
		service:     service,
		jwtVerifier: jwtVerifier,
	}
}

func (h *Handler) InitRoutes() *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(SecurityHeadersMiddleware)
	r.Use(MaxBodyMiddleware(64 << 10)) // 64 KB: telemetry payloads are tiny
	r.Use(h.jwtVerifier.Middleware)
	r.Use(NewRateLimiter(200, time.Minute).Middleware) // 200 req/min per IP (higher for IoT)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	r.Route("/api/v1", func(r chi.Router) {
		r.Use(h.AuthMiddleware)

		// Ingestion: device gateways authenticate with the service key (SERVICE);
		// the device itself must be linked to the batch (checked in the service).
		r.Group(func(r chi.Router) {
			r.Use(h.RoleMiddleware("SERVICE", "LOGISTICS", "MANUFACTURER"))
			r.Post("/telemetry", h.ingestTelemetry)
		})

		// Read-only routes (protected by API Key)
		r.Get("/telemetry/{batchId}", h.getReadings)
		r.Get("/telemetry/{batchId}/alerts", h.getAlerts)

		// Demo reset: ADMIN directly, or SERVICE when blockchain-service fans out an ADMIN reset
		r.Group(func(r chi.Router) {
			r.Use(h.RoleMiddleware("SERVICE", "ADMIN"))
			r.Post("/demo/reset/{batchId}", h.resetBatch)
		})
	})

	return r
}

// secureCompare performs a constant-time comparison of two strings.
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
			log.Printf("[AUTH] Denied access to %s %s from %s. Invalid API Key.", r.Method, r.URL.Path, r.RemoteAddr)
			http.Error(w, "Unauthorized: Invalid API Key", http.StatusUnauthorized)
			return
		}

		// No user JWT: the caller is a trusted internal service or device gateway.
		// It gets the limited SERVICE role, never ADMIN.
		if r.Header.Get("X-Verified-Role") == "" {
			r.Header.Set("X-Verified-Role", "SERVICE")
		}

		next.ServeHTTP(w, r)
	})
}

func (h *Handler) RoleMiddleware(allowedRoles ...string) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Role check using VERIFIED role from JWT
			role := r.Header.Get("X-Verified-Role")
			if role == "" {
				log.Printf("[ROLE] Access denied to %s %s: No verified role found", r.Method, r.URL.Path)
				http.Error(w, "Forbidden: Authentication required", http.StatusForbidden)
				return
			}

			allowed := false
			if role == "ADMIN" {
				allowed = true
			} else {
				for _, allowedRole := range allowedRoles {
					if role == allowedRole {
						allowed = true
						break
					}
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
		writeServiceError(w, r, err)
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
		writeServiceError(w, r, err)
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
		writeServiceError(w, r, err)
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
		writeServiceError(w, r, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"success"}`))
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

// RateLimiter implements a simple rate limiter per IP address.
type RateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	limit    int
	window   time.Duration
}

type visitor struct {
	count   int
	resetAt time.Time
}

// NewRateLimiter creates a new rate limiter.
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*visitor),
		limit:    limit,
		window:   window,
	}
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

// Middleware enforces rate limiting.
func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Trusted internal callers (portal, gateways) are not limited here;
		// the limiter protects against unauthenticated floods.
		if key := os.Getenv("INTERNAL_API_KEY"); key != "" && secureCompare(r.Header.Get("x-api-key"), key) {
			next.ServeHTTP(w, r)
			return
		}
		ip := clientIP(r)

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

// writeServiceError maps service errors to status codes without leaking internals.
func writeServiceError(w http.ResponseWriter, r *http.Request, err error) {
	switch {
	case errors.Is(err, service.ErrValidation):
		http.Error(w, err.Error(), http.StatusBadRequest)
	case errors.Is(err, service.ErrUnavailable):
		log.Printf("[ERROR] %s %s: %v", r.Method, r.URL.Path, err)
		http.Error(w, "Temporarily unavailable, retry later", http.StatusServiceUnavailable)
	default:
		log.Printf("[ERROR] %s %s: %v", r.Method, r.URL.Path, err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
	}
}

// MaxBodyMiddleware caps request bodies to protect against memory exhaustion.
func MaxBodyMiddleware(limit int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			r.Body = http.MaxBytesReader(w, r.Body, limit)
			next.ServeHTTP(w, r)
		})
	}
}

// clientIP returns the address the edge proxy saw. Proxies append to X-Forwarded-For,
// so only the last entry is trustworthy; earlier entries are client-controlled.
func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimSpace(parts[len(parts)-1])
	}
	return r.RemoteAddr
}

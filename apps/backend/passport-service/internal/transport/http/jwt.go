package http

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"log"
)

var (
	firebaseIssuer = "https://securetoken.google.com/"
	firebaseJWKS   = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
)

type FirebaseClaims struct {
	Role      string `json:"role"`
	CompanyID string `json:"company_id"`
	jwt.RegisteredClaims
}

type JWTVerifier struct {
	projectID  string
	publicKeys map[string]*rsa.PublicKey
	mu         sync.RWMutex
	expiry     time.Time
}

func NewJWTVerifier(projectID string) *JWTVerifier {
	return &JWTVerifier{
		projectID: projectID,
	}
}

func (v *JWTVerifier) getPublicKeys() (map[string]*rsa.PublicKey, error) {
	v.mu.RLock()
	if time.Now().Before(v.expiry) && v.publicKeys != nil {
		defer v.mu.RUnlock()
		return v.publicKeys, nil
	}
	v.mu.RUnlock()

	v.mu.Lock()
	defer v.mu.Unlock()

	// Double check after acquiring lock
	if time.Now().Before(v.expiry) && v.publicKeys != nil {
		return v.publicKeys, nil
	}

	log.Printf("[AUTH] Fetching Firebase public keys for project %s...", v.projectID)
	resp, err := http.Get(firebaseJWKS)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var keys map[string]string
	if err := json.NewDecoder(resp.Body).Decode(&keys); err != nil {
		return nil, err
	}

	newKeys := make(map[string]*rsa.PublicKey)
	for kid, keyStr := range keys {
		block, _ := pem.Decode([]byte(keyStr))
		if block == nil {
			continue
		}
		cert, err := x509.ParseCertificate(block.Bytes)
		if err != nil {
			continue
		}
		pubKey, ok := cert.PublicKey.(*rsa.PublicKey)
		if !ok {
			continue
		}
		newKeys[kid] = pubKey
	}

	v.publicKeys = newKeys
	// Cache for 1 hour or based on Cache-Control if we wanted to be perfect
	v.expiry = time.Now().Add(1 * time.Hour)
	
	return v.publicKeys, nil
}

func (v *JWTVerifier) Verify(tokenString string) (*FirebaseClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &FirebaseClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, errors.New("missing kid header")
		}

		keys, err := v.getPublicKeys()
		if err != nil {
			return nil, err
		}

		key, ok := keys[kid]
		if !ok {
			return nil, fmt.Errorf("key not found for kid: %s", kid)
		}

		return key, nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*FirebaseClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}

	// Additional validations using v5 Validator
	expectedIssuer := firebaseIssuer + v.projectID
	validator := jwt.NewValidator(
		jwt.WithIssuer(expectedIssuer),
		jwt.WithAudience(v.projectID),
	)
	
	if err := validator.Validate(claims); err != nil {
		return nil, fmt.Errorf("token validation failed: %w", err)
	}

	return claims, nil
}

// JWTMiddleware validates the Firebase JWT token and injects the role into the request context.
func (v *JWTVerifier) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// SECURITY: Clear any incoming verification headers to prevent spoofing
		r.Header.Del("X-Verified-Role")
		r.Header.Del("X-Verified-Company-ID")

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			// If no token, we still proceed but without verified role
			// Downstream RoleMiddleware will decide if it's okay
			next.ServeHTTP(w, r)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			LogStructured("WARN", "AUTH", "Invalid Authorization header format", map[string]interface{}{
				"remote_addr": r.RemoteAddr,
				"method":      r.Method,
				"path":        r.URL.Path,
			})
			http.Error(w, "Invalid auth header", http.StatusUnauthorized)
			return
		}

		claims, err := v.Verify(parts[1])
		if err != nil {
			LogStructured("ERROR", "AUTH", "JWT verification failed", map[string]interface{}{
				"remote_addr": r.RemoteAddr,
				"method":      r.Method,
				"path":        r.URL.Path,
				"error":       err.Error(),
			})
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		// Inject verified role into a header so we don't have to change all handler signatures
		// This is safer now because it was VERIFIED by this service.
		role := "USER"
		if claims.Role != "" {
			role = strings.ToUpper(claims.Role)
		}
		r.Header.Set("X-Verified-Role", role)

		// Inject verified company_id if present
		if claims.CompanyID != "" {
			r.Header.Set("X-Verified-Company-ID", claims.CompanyID)
		}

		LogStructured("INFO", "AUTH", "Verified identity injected", map[string]interface{}{
			"uid":        claims.Subject,
			"role":       role,
			"company_id": claims.CompanyID,
			"path":       r.URL.Path,
		})

		next.ServeHTTP(w, r)
	})
}

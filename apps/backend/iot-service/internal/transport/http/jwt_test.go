package http

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestJWTVerifier_Verify(t *testing.T) {
	// 1. Setup mock RSA key
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("Failed to generate private key: %v", err)
	}
	publicKey := &privateKey.PublicKey

	// 2. Setup mock JWKS server
	certBytes, err := x509.CreateCertificate(rand.Reader, &x509.Certificate{}, &x509.Certificate{}, publicKey, privateKey)
	if err != nil {
		t.Fatalf("Failed to create certificate: %v", err)
	}
	pemBytes := pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: certBytes})
	
	mockJWKS := map[string]string{
		"test-kid": string(pemBytes),
	}
	
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(mockJWKS)
	}))
	defer server.Close()

	// Override global for test
	oldJWKS := firebaseJWKS
	firebaseJWKS = server.URL
	defer func() { firebaseJWKS = oldJWKS }()

	projectID := "test-project"
	verifier := NewJWTVerifier(projectID)

	t.Run("Valid Token", func(t *testing.T) {
		claims := &FirebaseClaims{
			Role: "LOGISTICS",
			RegisteredClaims: jwt.RegisteredClaims{
				Issuer:    firebaseIssuer + projectID,
				Audience:  jwt.ClaimStrings{projectID},
				Subject:   "user-123",
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
			},
		}
		token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
		token.Header["kid"] = "test-kid"
		
		tokenString, err := token.SignedString(privateKey)
		if err != nil {
			t.Fatalf("Failed to sign token: %v", err)
		}

		verifiedClaims, err := verifier.Verify(tokenString)
		if err != nil {
			t.Errorf("Expected valid token, got error: %v", err)
		}
		if verifiedClaims.Role != "LOGISTICS" {
			t.Errorf("Expected role LOGISTICS, got %s", verifiedClaims.Role)
		}
	})

	t.Run("Valid Token with CompanyID", func(t *testing.T) {
		claims := &FirebaseClaims{
			Role:      "LOGISTICS",
			CompanyID: "comp-iot-123",
			RegisteredClaims: jwt.RegisteredClaims{
				Issuer:    firebaseIssuer + projectID,
				Audience:  jwt.ClaimStrings{projectID},
				Subject:   "user-123",
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
			},
		}
		token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
		token.Header["kid"] = "test-kid"
		tokenString, _ := token.SignedString(privateKey)

		verifiedClaims, err := verifier.Verify(tokenString)
		if err != nil {
			t.Fatalf("Expected valid token, got error: %v", err)
		}
		if verifiedClaims.Role != "LOGISTICS" {
			t.Errorf("Expected role LOGISTICS, got %s", verifiedClaims.Role)
		}
		if verifiedClaims.CompanyID != "comp-iot-123" {
			t.Errorf("Expected company comp-iot-123, got %s", verifiedClaims.CompanyID)
		}
	})

	t.Run("Invalid Claims", func(t *testing.T) {
		claims := &FirebaseClaims{
			RegisteredClaims: jwt.RegisteredClaims{
				Issuer:   "wrong-issuer",
				Audience: jwt.ClaimStrings{projectID},
			},
		}
		token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
		token.Header["kid"] = "test-kid"
		tokenString, _ := token.SignedString(privateKey)

		_, err := verifier.Verify(tokenString)
		if err == nil {
			t.Error("Expected error for invalid issuer, got nil")
		}
	})
}

func TestJWTVerifier_Middleware(t *testing.T) {
	privateKey, _ := rsa.GenerateKey(rand.Reader, 2048)
	publicKey := &privateKey.PublicKey
	certBytes, _ := x509.CreateCertificate(rand.Reader, &x509.Certificate{}, &x509.Certificate{}, publicKey, privateKey)
	pemBytes := pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: certBytes})
	
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]string{"test-kid": string(pemBytes)})
	}))
	defer server.Close()

	oldJWKS := firebaseJWKS
	firebaseJWKS = server.URL
	defer func() { firebaseJWKS = oldJWKS }()

	projectID := "test-project"
	verifier := NewJWTVerifier(projectID)

	t.Run("Middleware Sets Headers", func(t *testing.T) {
		claims := &FirebaseClaims{
			Role:      "LOGISTICS",
			CompanyID: "iot-company",
			RegisteredClaims: jwt.RegisteredClaims{
				Issuer:    firebaseIssuer + projectID,
				Audience:  jwt.ClaimStrings{projectID},
				Subject:   "iot-1",
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
			},
		}
		token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
		token.Header["kid"] = "test-kid"
		tokenString, _ := token.SignedString(privateKey)

		req := httptest.NewRequest("POST", "/api/v1/telemetry", nil)
		req.Header.Set("Authorization", "Bearer "+tokenString)
		rr := httptest.NewRecorder()

		handler := verifier.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role := r.Header.Get("X-Verified-Role")
			compID := r.Header.Get("X-Verified-Company-ID")
			
			if role != "LOGISTICS" {
				t.Errorf("Expected X-Verified-Role LOGISTICS, got %s", role)
			}
			if compID != "iot-company" {
				t.Errorf("Expected X-Verified-Company-ID iot-company, got %s", compID)
			}
			w.WriteHeader(http.StatusOK)
		}))

		handler.ServeHTTP(rr, req)
		if rr.Code != http.StatusOK {
			t.Errorf("Expected status OK, got %d", rr.Code)
		}
	})
}

package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"fmt"

	"github.com/global-foodtech-bridge/passport-service/internal/repository/postgres"
	"github.com/global-foodtech-bridge/passport-service/internal/service"
	transport "github.com/global-foodtech-bridge/passport-service/internal/transport/http"
	"github.com/jackc/pgx/v5/pgxpool"

	// Migration dependencies
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	// Validate critical env vars early
	if os.Getenv("INTERNAL_API_KEY") == "" {
		log.Fatal("FATAL: INTERNAL_API_KEY is not set. Refusing to start without authentication configured.")
	}

	// Connect to DB
	config, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		log.Fatalf("Unable to parse DATABASE_URL: %v\n", err)
	}
	
	dbpool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v\n", err)
	}
	defer dbpool.Close()

	// Verify connection immediately
	if err := dbpool.Ping(context.Background()); err != nil {
		log.Fatalf("Unable to connect to database (Ping failed): %v\n", err)
	}
	log.Println("Successfully connected to Database")

	// Run Migrations
	if err := runMigrations(dbURL); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Init Dependencies
	repo := postgres.NewBatchRepository(dbpool)
	companyRepo := postgres.NewCompanyRepository(dbpool)
	templateRepo := postgres.NewTemplateRepository(dbpool)
	complianceRepo := postgres.NewComplianceRepository(dbpool)

	svc := service.NewBatchService(repo, complianceRepo)
	walletSvc := service.NewWalletService()
	companySvc := service.NewCompanyService(companyRepo, walletSvc)
	templateSvc := service.NewTemplateService(templateRepo)

	// Ensure default templates are present (no crutches, but demo-ready)
	if err := templateSvc.InitDefaults(context.Background()); err != nil {
		log.Printf("Warning: failed to seed default templates: %v", err)
	}

	jwtProjectID := os.Getenv("FIREBASE_PROJECT_ID")
	if jwtProjectID == "" {
		jwtProjectID = "global-foodtech-bridge-prod"
		log.Printf("Warning: FIREBASE_PROJECT_ID not set, using default: %s", jwtProjectID)
	}
	verifier := transport.NewJWTVerifier(jwtProjectID)

	handler := transport.NewHandler(svc, companySvc, templateSvc, verifier)

	// Init Router
	router := handler.InitRoutes()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Graceful Shutdown
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Passport Service starting on port %s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit
	log.Printf("Received signal %s. Shutting down gracefully...", sig)

	// Give in-flight requests 10 seconds to complete
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Passport Service stopped cleanly.")
}

func runMigrations(dbURL string) error {
	log.Println("Running database migrations...")
	
	m, err := migrate.New(
		"file://migrations",
		dbURL,
	)
	if err != nil {
		return fmt.Errorf("could not create migrate instance: %w", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("could not apply migrations: %w", err)
	}

	log.Println("Migrations applied successfully!")
	return nil
}

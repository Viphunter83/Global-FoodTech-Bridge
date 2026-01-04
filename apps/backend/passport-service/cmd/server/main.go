package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/global-foodtech-bridge/passport-service/internal/repository/postgres"
	"github.com/global-foodtech-bridge/passport-service/internal/service"
	transport "github.com/global-foodtech-bridge/passport-service/internal/transport/http"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set")
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

	// Init Dependencies
	// Init Dependencies
	repo := postgres.NewBatchRepository(dbpool)
	companyRepo := postgres.NewCompanyRepository(dbpool)

	svc := service.NewBatchService(repo)
	walletSvc := service.NewWalletService()
	companySvc := service.NewCompanyService(companyRepo, walletSvc)

	handler := transport.NewHandler(svc, companySvc)

	// Init Router
	router := handler.InitRoutes()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

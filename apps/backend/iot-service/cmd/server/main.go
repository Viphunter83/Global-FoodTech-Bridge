package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/global-foodtech-bridge/iot-service/internal/repository/postgres"
	"github.com/global-foodtech-bridge/iot-service/internal/service"
	transport "github.com/global-foodtech-bridge/iot-service/internal/transport/http"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	// Connect to DB
	dbpool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v\n", err)
	}
	defer dbpool.Close()

	// Connect to Redis
	redisURL := os.Getenv("REDIS_URL")
	var rdb *redis.Client
	if redisURL != "" && (len(redisURL) > 8 && redisURL[:8] == "redis://") {
		opts, err := redis.ParseURL(redisURL)
		if err != nil {
			log.Fatalf("Invalid REDIS_URL: %v\n", err)
		}
		rdb = redis.NewClient(opts)
	} else {
		if redisURL == "" {
			redisURL = "redis:6379"
		}
		rdb = redis.NewClient(&redis.Options{
			Addr: redisURL,
		})
	}
	
	// Test Redis connection
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		log.Printf("Warning: Redis not reachable: %v. Events will fail.", err)
	}

	// Init Dependencies
	repo := postgres.NewTelemetryRepository(dbpool)
	svc := service.NewTelemetryService(repo, rdb)
	handler := transport.NewHandler(svc)

	// Init Router
	router := handler.InitRoutes()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081" // Defaulting to 8081 to avoid conflict with passport-service if run locally without docker
	}

	log.Printf("IoT Service starting on port %s", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

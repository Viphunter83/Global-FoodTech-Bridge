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
	"fmt"
	"strings"

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

	// Connect to DB
	dbpool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v\n", err)
	}
	defer dbpool.Close()

	// Verify connection
	if err := dbpool.Ping(context.Background()); err != nil {
		log.Fatalf("Unable to connect to database (Ping failed): %v\n", err)
	}

	// Run Migrations
	if err := runMigrations(dbURL); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

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
	
	// Create handler and routes
	iotHandler := transport.NewHandler(svc)
	router := iotHandler.InitRoutes()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("IoT Service starting on port %s", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func runMigrations(dbURL string) error {
	log.Println("Running database migrations...")

	// Use a separate migrations table for iot-service
	migrationURL := dbURL
	if strings.Contains(migrationURL, "?") {
		migrationURL += "&x-migrations-table=iot_schema_migrations"
	} else {
		migrationURL += "?x-migrations-table=iot_schema_migrations"
	}

	m, err := migrate.New(
		"file://migrations",
		migrationURL,
	)
	if err != nil {
		return fmt.Errorf("could not create migrate instance: %w", err)
	}
	defer m.Close()

	if err := m.Up(); err != nil {
		if err == migrate.ErrNoChange {
			log.Println("No new migrations to apply.")
			return nil
		}
		
		// Auto-healing for dirty migrations
		if strings.Contains(err.Error(), "Dirty database") {
			log.Printf("Detected dirty database state: %v. Attempting to force-fix to last stable version...", err)
			// Force to the version before the failing one
			if forceErr := m.Force(20260421042018); forceErr != nil {
				return fmt.Errorf("could not force version after dirty state: %w", forceErr)
			}
			log.Println("Force-fix successful. Re-attempting migration...")
			return m.Up()
		}
		
		return fmt.Errorf("could not apply migrations: %w", err)
	}

	log.Println("Migrations applied successfully!")
	return nil
}

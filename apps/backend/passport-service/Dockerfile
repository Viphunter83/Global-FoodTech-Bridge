# Stage 1: Builder
FROM golang:1.24 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build the binary
# CGO_ENABLED=0 for static binary, though less critical on Debian, still good practice
RUN CGO_ENABLED=0 GOOS=linux go build -o passport-service cmd/server/main.go

# Stage 2: Runner
FROM debian:bookworm-slim

WORKDIR /app

# Install ca-certificates
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy binary from builder
COPY --from=builder /app/passport-service .
COPY migrations ./migrations

EXPOSE 8080

CMD ["./passport-service"]

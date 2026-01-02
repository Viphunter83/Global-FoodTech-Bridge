# Stage 1: Builder
FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build the binary
# CGO_ENABLED=0 ensures a static binary, crucial for alpine
RUN CGO_ENABLED=0 GOOS=linux go build -o passport-service cmd/server/main.go

# Stage 2: Runner
FROM alpine:latest

WORKDIR /app

# Install ca-certificates for potential HTTPS calls (good practice)
RUN apk --no-cache add ca-certificates

# Copy binary from builder
COPY --from=builder /app/passport-service .
# Copy migrations if needed for runtime migration tools (optional, but good to have)
COPY migrations ./migrations

EXPOSE 8080

CMD ["./passport-service"]

# Stage 1: Builder
FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -o iot-service cmd/server/main.go

# Stage 2: Runner
FROM alpine:latest

WORKDIR /app

RUN apk --no-cache add ca-certificates

COPY --from=builder /app/iot-service .
COPY migrations ./migrations

EXPOSE 8081

CMD ["./iot-service"]

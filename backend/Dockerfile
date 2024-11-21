# Etap 1: Budowanie aplikacji Go
FROM golang:1.23-alpine as builder

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie plików go.mod i go.sum
COPY go.mod go.sum ./

# Pobieranie zależności
RUN go mod tidy

# Kopiowanie całej aplikacji
COPY . .

# Kompilacja aplikacji
RUN go build -o /app/main .

# Etap 2: Uruchomienie aplikacji w produkcji
FROM alpine:latest

# Instalacja zależności runtime (np. SSL, itp.)
RUN apk --no-cache add ca-certificates

# Kopiowanie skompilowanego pliku z poprzedniego etapu
COPY --from=builder /app/main /app/main

# Ustawienie zmiennej środowiskowej
ENV PORT=8080

# Otwórz port dla aplikacji
EXPOSE 8080

# Uruchom aplikację
CMD ["/app/main"]
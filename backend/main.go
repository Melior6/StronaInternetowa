package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

// Zmienna globalna do przechowywania połączenia z bazą danych
var db *sql.DB

// Struktura użytkownika
type User struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"password_hash"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Connect do bazy danych
func Connect() error {
	// Pobieranie zmiennych środowiskowych
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	// Tworzenie łańcucha połączenia
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", dbHost, dbPort, dbUser, dbPassword, dbName)
	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("could not connect to the database: %v", err)
	}

	// Test połączenia
	if err = db.Ping(); err != nil {
		return fmt.Errorf("could not ping the database: %v", err)
	}

	return nil
}

// Handler dla /hello
func helloHandler(w http.ResponseWriter, r *http.Request) {
	currentTime := time.Now().Format(time.RFC1123)
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(fmt.Sprintf(`{"message": "Hello, the current time is %s"}`, currentTime)))
}

// Handler dla /endpoints
func endpointsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"endpoints": ["/hello", "/endpoints", "/register", "/login", "/usercount", "/users"]}`))
}

// Handler rejestracji użytkownika
func registerHandler(w http.ResponseWriter, r *http.Request) {
	var user User
	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	user.Username = r.FormValue("username")
	user.Email = r.FormValue("email")
	password := r.FormValue("password")

	// Hashowanie hasła
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	// Zapisanie użytkownika w bazie danych
	_, err = db.Exec(`INSERT INTO users (username, email, password_hash, created_at, updated_at)
					  VALUES ($1, $2, $3, NOW(), NOW())`, user.Username, user.Email, string(hashedPassword))
	if err != nil {
		http.Error(w, "Error inserting user into database", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(fmt.Sprintf(`{"message": "User %s registered successfully"}`, user.Username)))
}

// Handler logowania użytkownika
func loginHandler(w http.ResponseWriter, r *http.Request) {
	var user User
	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	user.Username = r.FormValue("username")
	password := r.FormValue("password")

	// Wyszukiwanie użytkownika w bazie
	row := db.QueryRow("SELECT id, username, email, password_hash, created_at, updated_at FROM users WHERE username = $1", user.Username)
	var storedPassword string
	err = row.Scan(&user.ID, &user.Username, &user.Email, &storedPassword, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	// Sprawdzanie hasła
	err = bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(password))
	if err != nil {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	w.Write([]byte(fmt.Sprintf(`{"message": "User %s logged in successfully"}`, user.Username)))
}

// Handler dla /usercount
func userCountHandler(w http.ResponseWriter, r *http.Request) {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		http.Error(w, "Error retrieving user count", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(fmt.Sprintf(`{"user_count": %d}`, count)))
}

// Handler dla /users (wymaga hasła)
func usersHandler(w http.ResponseWriter, r *http.Request) {
	// Weryfikacja hasła w nagłówku Authorization
	authHeader := r.Header.Get("Authorization")
	if authHeader != "Bearer supersecretpassword" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := db.Query("SELECT id, username, email, password_hash, created_at, updated_at FROM users")
	if err != nil {
		http.Error(w, "Error retrieving users", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			http.Error(w, "Error scanning user data", http.StatusInternalServerError)
			return
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "Error iterating through rows", http.StatusInternalServerError)
		return
	}

	// Zwrócenie listy użytkowników
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(fmt.Sprintf(`{"users": %+v}`, users)))
}

func main() {
	// Łączenie z bazą danych
	err := Connect()
	if err != nil {
		log.Fatalf("Error connecting to the database: %v", err)
	}
	defer db.Close()

	// Konfiguracja routera
	r := mux.NewRouter()

	// Definicja endpointów
	r.HandleFunc("/hello", helloHandler).Methods("GET")
	r.HandleFunc("/endpoints", endpointsHandler).Methods("GET")
	r.HandleFunc("/register", registerHandler).Methods("POST")
	r.HandleFunc("/login", loginHandler).Methods("POST")
	r.HandleFunc("/usercount", userCountHandler).Methods("GET")
	r.HandleFunc("/users", usersHandler).Methods("GET")

	// Uruchomienie serwera
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server starting on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

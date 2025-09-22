package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"sort"
	"sync"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type ScoreEntry struct {
	Wallet string `json:"wallet"`
	Score  int    `json:"score"`
}

var (
	scoresFile = "scores.json"
	mutex      = &sync.Mutex{}
)

// Load scores from file
func loadScores() ([]ScoreEntry, error) {
	data, err := ioutil.ReadFile(scoresFile)
	if err != nil {
		return nil, err
	}
	var scores []ScoreEntry
	if err := json.Unmarshal(data, &scores); err != nil {
		return nil, err
	}
	return scores, nil
}

// Save scores to file
func saveScores(scores []ScoreEntry) error {
	data, err := json.MarshalIndent(scores, "", "  ")
	if err != nil {
		return err
	}
	return ioutil.WriteFile(scoresFile, data, 0644)
}

// Submit a new score (update if wallet already exists with lower score)
func submitScore(w http.ResponseWriter, r *http.Request) {
	var entry ScoreEntry
	if err := json.NewDecoder(r.Body).Decode(&entry); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	mutex.Lock()
	defer mutex.Unlock()

	scores, _ := loadScores()

	updated := false
	for i, s := range scores {
		if s.Wallet == entry.Wallet {
			if entry.Score > s.Score {
				scores[i].Score = entry.Score // Update to higher score
			}
			updated = true
			break
		}
	}
	if !updated {
		scores = append(scores, entry) // New wallet
	}

	saveScores(scores)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "score saved",
		"wallet":  entry.Wallet,
		"message": "success",
	})
}

// Leaderboard handler — returns scores sorted in descending order
func getLeaderboard(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	defer mutex.Unlock()

	scores, err := loadScores()
	if err != nil {
		http.Error(w, "Cannot read scores", http.StatusInternalServerError)
		return
	}

	// Sort descending by score
	sort.Slice(scores, func(i, j int) bool {
		return scores[i].Score > scores[j].Score
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(scores)
}

// Entry point
func main() {
	r := mux.NewRouter()
	r.HandleFunc("/submit-score", submitScore).Methods("POST")
	r.HandleFunc("/leaderboard", getLeaderboard).Methods("GET")

	// Enable CORS so frontend (localhost:3000/3001) can talk to backend
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:3001"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Println("Server running at http://localhost:" + port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

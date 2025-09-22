package main

import (
	"encoding/json"
	"net/http"
	"sort"
	"sync"
)

// ScoreEntry represents a player's score
type ScoreEntry struct {
	Wallet string `json:"wallet"`
	Score  int    `json:"score"`
}

// Global leaderboard and mutex
var (
	leaderboard      []ScoreEntry
	leaderboardMutex sync.Mutex
)

// Leaderboard handler with descending sort
func leaderboardHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	leaderboardMutex.Lock()
	defer leaderboardMutex.Unlock()

	// Sort the leaderboard in descending order by score
	sort.Slice(leaderboard, func(i, j int) bool {
		return leaderboard[i].Score > leaderboard[j].Score
	})

	// Send sorted leaderboard as JSON
	json.NewEncoder(w).Encode(leaderboard)
}

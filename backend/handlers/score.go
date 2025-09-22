package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"puzzle-game-backend/solana"
	"github.com/portto/solana-go-sdk/types"
)

type scoreReq struct {
	Wallet string `json:"wallet"` // Phantom public key (base58)
	Score  uint8  `json:"score"`
	// In production you’d also collect the Phantom signature & verify
}

func SubmitScore(w http.ResponseWriter, r *http.Request) {
	var req scoreReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad json", 400)
		return
	}

	user := types.Account{
		PublicKey: solana.MustPublicKeyFromBase58(req.Wallet),
		// For a real dApp you do **not** know user’s secret key.
		// Here we assume Phantom sends a fully‑signed transaction client‑side
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	if err := solana.SubmitScore(ctx, user, req.Score); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.WriteHeader(200)
	w.Write([]byte("Score recorded"))
}

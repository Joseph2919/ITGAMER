package solana

import (
	"context"
	"encoding/binary"
	"log"
	"os"

	solana "github.com/portto/solana-go-sdk/client"
	"github.com/portto/solana-go-sdk/common"
	"github.com/portto/solana-go-sdk/types"
)

var (
	Client     *solana.Client
	ProgramID  common.PublicKey
	Payer      types.Account // server’s fee‑payer account
)

func Init() {
	url := os.Getenv("RPC_URL")
	Client = solana.NewClient(url)

	ProgramID = common.PublicKeyFromString(os.Getenv("PROGRAM_ID"))

	// Load local keypair for fees (anchor generated one) – adjust path as needed
	var err error
	Payer, err = types.AccountFromPemFile(os.Getenv("HOME") + "/.config/solana/id.json")
	if err != nil {
		log.Fatalln("load payer:", err)
	}
}

/// Pushes the (wallet, score) instruction to chain.
func SubmitScore(ctx context.Context, user types.Account, score uint8) error {
	// Derive PDA = seeds("player", user)
	seed := append([]byte("player"), user.PublicKey[:]...)
	pda, bump := common.FindProgramAddress(seed, ProgramID)

	// Build instruction data = [score] (1 byte)
	data := []byte{score}

	ix := types.Instruction{
		ProgramID: ProgramID,
		Accounts: []types.AccountMeta{
			{PubKey: pda, IsSigner: false, IsWritable: true},
			{PubKey: user.PublicKey, IsSigner: true, IsWritable: true},
			{PubKey: common.SystemProgramID, IsSigner: false, IsWritable: false},
		},
		Data: append(data, bump), // (Anchor uses bump as trailing byte)
	}

	recent, err := Client.GetLatestBlockhash(ctx)
	if err != nil {
		return err
	}

	tx, err := types.NewTransaction(types.NewTransactionParam{
		Message: types.NewMessage(types.NewMessageParam{
			FeePayer:        Payer.PublicKey,
			RecentBlockhash: recent.Blockhash,
			Instructions:    []types.Instruction{ix},
		}),
		Signers: []types.Account{Payer, user},
	})
	if err != nil {
		return err
	}

	_, err = Client.SendTransaction(ctx, tx)
	return err
}

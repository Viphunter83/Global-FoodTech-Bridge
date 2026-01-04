package service

import (
	"crypto/ecdsa"
	"encoding/hex"
	"fmt"

	"github.com/ethereum/go-ethereum/crypto"
)

type WalletService struct{}

func NewWalletService() *WalletService {
	return &WalletService{}
}

// GenerateWallet returns address (0x...), privateKey (hex), error
func (s *WalletService) GenerateWallet() (string, string, error) {
	privateKey, err := crypto.GenerateKey()
	if err != nil {
		return "", "", fmt.Errorf("failed to generate key: %w", err)
	}

	privateKeyBytes := crypto.FromECDSA(privateKey)
	privateKeyHex := hex.EncodeToString(privateKeyBytes)

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return "", "", fmt.Errorf("error casting public key to ECDSA")
	}

	// Address is 0x...
	address := crypto.PubkeyToAddress(*publicKeyECDSA).Hex()

	return address, privateKeyHex, nil
}

// EncryptKey is a placeholder for now. In prod use KMS.
// For MVP, we prefix with "enc:" to simulate encryption storage.
func (s *WalletService) EncryptKey(privateKeyHex string) (string, error) {
	return "enc:" + privateKeyHex, nil
}

func (s *WalletService) DecryptKey(encryptedKey string) (string, error) {
	if len(encryptedKey) > 4 && encryptedKey[:4] == "enc:" {
		return encryptedKey[4:], nil
	}
	return encryptedKey, nil
}

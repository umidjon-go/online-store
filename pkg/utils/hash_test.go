package utils

import (
	"testing"
)

func TestHashPassword(t *testing.T) {
	password := "admin123"
	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	if !CheckPasswordHash(password, hash) {
		t.Fatalf("password mismatch")
	}

	if CheckPasswordHash("wrongpass", hash) {
		t.Fatalf("wrong password should not match")
	}

	t.Logf("Generated hash for 'admin123': %s", hash)
}


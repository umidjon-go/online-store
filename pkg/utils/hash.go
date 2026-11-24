package utils

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword parolni bcrypt orqali qaytarib bo'lmas xeshga (hash) aylantiradi
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("parolni xeshlashda xatolik: %w", err)
	}
	return string(bytes), nil
}

// CheckPasswordHash kiritilgan ochiq parol bilan bazadagi xeshni solishtiradi
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}


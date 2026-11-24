package utils

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type CustomClaims struct {
	EmployeeID int64  `json:"employee_id"`
	Phone      string `json:"phone"`
	Role       string `json:"role"`
	jwt.RegisteredClaims
}

func getJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "tezbozor-super-secret-key-2026-production"
	}
	return []byte(secret)
}

// GenerateToken xodim ma'lumotlari asosida yangi JWT token yasaydi (muddati 24 soat)
func GenerateToken(employeeID int64, phone, role string) (string, error) {
	claims := CustomClaims{
		EmployeeID: employeeID,
		Phone:      phone,
		Role:       role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "tezbozor-api",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJWTSecret())
}

// ValidateToken tokenni tekshiradi va uning ichidagi ma'lumotlarni (claims) qaytaradi
func ValidateToken(tokenString string) (*CustomClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("noto'g'ri imzolash usuli")
		}
		return getJWTSecret(), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*CustomClaims)
	if !ok || !token.Valid {
		return nil, errors.New("yaroqsiz yoki muddati o'tgan token")
	}

	return claims, nil
}


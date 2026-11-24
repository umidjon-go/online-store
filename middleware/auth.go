package middleware

import (
	"net/http"
	"online-store/pkg/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware so'rov sarlavhasidagi Authorization Bearer tokenni qat'iy tekshiradi
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "avtorizatsiya sarlavhasi (Authorization header) kiritilmagan",
			})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "noto'g'ri avtorizatsiya formati (namuna: Bearer <token>)",
			})
			return
		}

		tokenString := parts[1]
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "yaroqsiz yoki muddati o'tgan token",
			})
			return
		}

		// Xodim ma'lumotlarini contextga saqlaymiz
		c.Set("employee_id", claims.EmployeeID)
		c.Set("phone", claims.Phone)
		c.Set("role", claims.Role)

		c.Next()
	}
}

// OptionalAuthMiddleware agar token yuborilgan bo'lsa uni tekshirib contextga saqlaydi, token yo'q bo'lsa ham so'rovni to'xtatmaydi
func OptionalAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				if claims, err := utils.ValidateToken(parts[1]); err == nil {
					c.Set("employee_id", claims.EmployeeID)
					c.Set("phone", claims.Phone)
					c.Set("role", claims.Role)
				}
			}
		}
		c.Next()
	}
}

// RequireRole RBAC ruxsatlarini tekshiruvchi middleware: faqat ko'rsatilgan rollargina o'tishi mumkin
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("role")
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "foydalanuvchi roli aniqlanmadi (avtorizatsiyadan o'tilmagan)",
			})
			return
		}

		currentRole, ok := roleVal.(string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "rol ma'lumotida xatolik",
			})
			return
		}

		for _, allowed := range allowedRoles {
			if strings.EqualFold(currentRole, allowed) {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"error": "ushbu amalni bajarish uchun sizda yetarli ruxsat (huquq) yo'q",
		})
	}
}

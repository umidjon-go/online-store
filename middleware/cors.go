package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware frontend va API o'rtasida domenlararo so'rovlarni (CORS) xavfsiz o'tkazishni ta'minlaydi

// CORS (Cross-Origin Resource Sharing): Frontend (React) va Backend (Go) turli portlarda yoki domenlarda ishlayotganda,
// brauzer xavfsizlik sababli ularning o'zaro suhbatini bloklaydi (Cross-Origin). Bu middleware shunga ruxsat beradi.

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) { // Har bir kelgan HTTP sorov uchun alohida ishga tushadigan anonim funksiya.
		// c bu context bo'lib, u kelayotgan so'rov va ketayotgan javobni o'zida saqlaydi. Shu orqali biz so'rovga javob qaytaramiz

		c.Writer.Header().Set("Access-Control-Allow-Origin", "*") // Eng muhim qator! Brauzerga: "Istalgan veb-sayt (yoki frontend)
		// bizning backendga sorov yuborishi mumkin" deb ruxsat beradi (* belgisibarcha domenlarga ruxsat berishni anglatadi)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true") //
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// LoggerMiddleware kelayotgan har bir HTTP so'rovni status, bajarilish vaqti, mijoz IP manzili va yo'li bilan konsolga yozib boradi
func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		c.Next()

		latency := time.Since(start)
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()

		if raw != "" {
			path = path + "?" + raw
		}

		log.Printf("[API] %3d | %13v | %15s | %-7s %s\n",
			statusCode,
			latency,
			clientIP,
			method,
			path,
		)
	}
}


package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5" // ต้องเป็น v5 ตามที่คุณลงไว้
)

// AuthMiddleware รับ jwtKey มาจาก main หรือ config
func AuthMiddleware(jwtKey []byte) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "กรุณาเข้าสู่ระบบก่อน"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil // ใช้คีย์ลับที่คุณตั้งไว้
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token ไม่ถูกต้องหรือหมดอายุ"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if ok && token.Valid {
			// ต้องมั่นใจว่าแปลงค่า user_id จาก token เป็น uint อย่างถูกต้อง
			userID := uint(claims["user_id"].(float64))
			c.Set("user_id", userID) // ✅ เก็บไว้เพื่อเรียกใช้ใน main.go
			c.Next()
		}
	}
}

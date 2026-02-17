package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware ทำหน้าที่เป็นด่านตรวจ Token
func AuthMiddleware(jwtKey []byte) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "กรุณาเข้าสู่ระบบก่อน"})
			c.Abort()
			return
		}

		// ตัดคำว่า Bearer ออกเพื่อให้เหลือแค่ตัว Token
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "ตั๋วของคุณปลอมหรือหมดอายุแล้ว"})
			c.Abort()
			return
		}

		c.Next() // ผ่านด่าน!
	}
}

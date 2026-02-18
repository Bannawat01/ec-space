package handlers

import (
	"net/http"

	"github.com/Bannawat01/ec-space/config"
	"github.com/Bannawat01/ec-space/models"
	"github.com/gin-gonic/gin"
)

// GetProfile - Get user profile
func GetProfile(c *gin.Context) {
	val, exists := c.Get("user_id")
	if !exists || val == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "กรุณาเข้าสู่ระบบใหม่"})
		return
	}

	userID := val.(uint)
	var user models.User

	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลผู้ใช้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":       user.ID,
		"username": user.Username,
		"credits":  user.Credits,
		"role":     user.Role,
	})
}

// Topup - Add credits to user account
func Topup(c *gin.Context) {
	val, exists := c.Get("user_id")
	if !exists || val == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "เซสชันหมดอายุ กรุณาล็อกอินใหม่"})
		return
	}

	userID := val.(uint)

	var input struct {
		Amount float64 `json:"amount"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลการเติมเงินไม่ถูกต้อง"})
		return
	}

	db := config.GetDB()
	if err := db.Model(&models.User{}).Where("id = ?", userID).
		Update("credits", db.Raw("credits + ?", input.Amount)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ระบบธนาคารกลางขัดข้อง"})
		return
	}

	var user models.User
	config.DB.First(&user, userID)

	c.JSON(http.StatusOK, gin.H{
		"message":     "เติมเครดิตสำเร็จ!",
		"new_balance": user.Credits,
	})
}

package handlers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"

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
		"email":    user.Email,
		"address":  user.Address,
		"avatar":   user.Avatar,
	})
}

// UpdateProfile - update user's profile (address and email)
func UpdateProfile(c *gin.Context) {
	val, exists := c.Get("user_id")
	if !exists || val == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "กรุณาเข้าสู่ระบบใหม่"})
		return
	}

	userID := val.(uint)

	// Support both JSON and multipart/form-data (for avatar upload)
	var input struct {
		Email   string
		Address string
	}

	contentType := c.ContentType()
	if strings.HasPrefix(contentType, "multipart/form-data") {
		input.Email = c.PostForm("email")
		input.Address = c.PostForm("address")
	} else {
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลที่ส่งมาไม่ถูกต้อง"})
			return
		}
	}

	db := config.GetDB()
	updates := map[string]interface{}{}
	if input.Email != "" {
		updates["email"] = input.Email
	}
	if input.Address != "" {
		updates["address"] = input.Address
	}

	// Handle avatar file if present
	file, err := c.FormFile("avatar")
	if err == nil && file != nil {
		// ensure extension preserved
		ext := filepath.Ext(file.Filename)
		filename := fmt.Sprintf("uploads/avatar_%d_%d%s", userID, time.Now().Unix(), ext)
		if err := c.SaveUploadedFile(file, filename); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัพโหลดไฟล์ได้"})
			return
		}
		updates["avatar"] = filename
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่มีข้อมูลให้แก้ไข"})
		return
	}

	if err := db.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัพเดตโปรไฟล์ได้"})
		return
	}

	var user models.User
	db.First(&user, userID)

	c.JSON(http.StatusOK, gin.H{
		"message": "อัพเดตโปรไฟล์เรียบร้อย",
		"profile": gin.H{"id": user.ID, "username": user.Username, "email": user.Email, "address": user.Address, "avatar": user.Avatar, "credits": user.Credits},
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

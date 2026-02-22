package handlers

import (
	"net/http"

	"github.com/Bannawat01/ec-space/config"
	"github.com/Bannawat01/ec-space/models"
	"github.com/gin-gonic/gin"
)

// GetWeapons - Get all weapons (public)
func GetWeapons(c *gin.Context) {
	var weapons []models.Weapon
	config.DB.Find(&weapons)
	c.JSON(http.StatusOK, weapons)
}

// GetWeapon - Get a single weapon by ID (public)
func GetWeapon(c *gin.Context) {
	id := c.Param("id")
	var weapon models.Weapon

	if err := config.DB.First(&weapon, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบอาวุธ"})
		return
	}

	c.JSON(http.StatusOK, weapon)
}

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

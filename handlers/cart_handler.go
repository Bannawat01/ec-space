package handlers

import (
	"fmt"
	"net/http"

	"github.com/Bannawat01/ec-space/config"
	"github.com/Bannawat01/ec-space/models"
	"github.com/gin-gonic/gin"
)

// GetCart - Get user cart
func GetCart(c *gin.Context) {
	val, exists := c.Get("user_id")
	if !exists || val == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "กรุณาเข้าสู่ระบบใหม่"})
		return
	}

	userID := val.(uint)
	var items []models.CartItem
	config.DB.Preload("Weapon").Where("user_id = ?", userID).Find(&items)
	c.JSON(200, items)
}

// AddToCart - Add item to cart
func AddToCart(c *gin.Context) {
	val, exists := c.Get("user_id")
	if !exists || val == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "เซสชันหมดอายุ"})
		return
	}

	userID := val.(uint)

	var input struct {
		WeaponID uint `json:"weapon_id" binding:"required"`
		Quantity int  `json:"quantity" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง: " + err.Error()})
		return
	}

	// Validate weapon exists and check stock
	var weapon models.Weapon
	if err := config.DB.First(&weapon, input.WeaponID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "สินค้าไม่พบ"})
		return
	}

	// Check stock availability
	if weapon.Stock < input.Quantity {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("สินค้ามีไม่เพียงพอ คงเหลือ %d ชิ้น", weapon.Stock)})
		return
	}

	var cartItem models.CartItem
	err := config.DB.Where("user_id = ? AND weapon_id = ?", userID, input.WeaponID).First(&cartItem).Error

	if err == nil {
		// Item already in cart - update quantity
		newQty := cartItem.Quantity + input.Quantity
		if newQty > weapon.Stock {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("จำนวนที่ขอมากเกินไป คงเหลือ %d ชิ้น", weapon.Stock)})
			return
		}
		config.DB.Model(&cartItem).Update("quantity", newQty)
	} else {
		// New item - create cart item
		config.DB.Create(&models.CartItem{
			UserID:   userID,
			WeaponID: input.WeaponID,
			Quantity: input.Quantity,
		})
	}

	c.JSON(http.StatusOK, gin.H{"message": "บันทึกตะกร้าสำเร็จ", "weapon": weapon})
}

// RemoveFromCart - Remove item from cart
func RemoveFromCart(c *gin.Context) {
	val, exists := c.Get("user_id")
	if !exists || val == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userID := val.(uint)
	weaponID := c.Param("weapon_id")
	config.DB.Where("user_id = ? AND weapon_id = ?", userID, weaponID).Delete(&models.CartItem{})
	c.JSON(200, gin.H{"message": "ลบสำเร็จ"})
}

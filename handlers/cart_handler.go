package handlers

import (
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
		WeaponID uint `json:"weapon_id"`
		Quantity int  `json:"quantity"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	// validate weapon exists and check stock
	var weapon models.Weapon
	if err := config.DB.First(&weapon, input.WeaponID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบสินค้า"})
		return
	}

	// Allow positive quantities (add) and negative quantities (remove/decrement)
	if input.Quantity == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ปริมาณต้องไม่เป็นศูนย์"})
		return
	}

	var cartItem models.CartItem
	err := config.DB.Where("user_id = ? AND weapon_id = ?", userID, input.WeaponID).First(&cartItem).Error

	if err == nil {
		// existing cart item: adjust quantity
		newQty := cartItem.Quantity + input.Quantity
		if newQty <= 0 {
			// remove the item from cart
			config.DB.Delete(&cartItem)
			c.JSON(http.StatusOK, gin.H{"message": "ลบสินค้าออกจากตะกร้า"})
			return
		}
		if newQty > weapon.Stock {
			c.JSON(http.StatusBadRequest, gin.H{"error": "จำนวนในตะกร้าจะเกินสต็อก"})
			return
		}
		config.DB.Model(&cartItem).Update("quantity", newQty)
		c.JSON(http.StatusOK, gin.H{"message": "อัปเดตจำนวนในตะกร้าเรียบร้อย"})
		return
	}

	// no existing cart item
	if input.Quantity < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถลดจำนวนสินค้าที่ยังไม่มีในตะกร้า"})
		return
	}

	if input.Quantity > weapon.Stock {
		c.JSON(http.StatusBadRequest, gin.H{"error": "จำนวนที่ต้องการมากกว่าสต็อก"})
		return
	}

	config.DB.Create(&models.CartItem{
		UserID:   userID,
		WeaponID: input.WeaponID,
		Quantity: input.Quantity,
	})

	c.JSON(http.StatusOK, gin.H{"message": "บันทึกตะกร้าสำเร็จ"})
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

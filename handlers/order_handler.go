package handlers

import (
	"net/http"
	"time"

	"github.com/Bannawat01/ec-space/config"
	"github.com/Bannawat01/ec-space/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetOrders - Get user order history
func GetOrders(c *gin.Context) {
	val, _ := c.Get("user_id")
	userID := val.(uint)

	var orders []models.Order
	config.DB.Preload("Items.Weapon").Where("user_id = ?", userID).Order("created_at desc").Find(&orders)

	c.JSON(http.StatusOK, orders)
}

// CreateOrder - Checkout and create order
func CreateOrder(c *gin.Context) {
	val, exists := c.Get("user_id")
	if !exists || val == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userID := val.(uint)

	var input struct {
		Total float64 `json:"total"`
		Items []struct {
			WeaponID uint `json:"weapon_id"`
			Quantity int  `json:"quantity"`
		} `json:"items"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	tx := config.DB.Begin()

	// 1. Check user credits
	var user models.User
	tx.First(&user, userID)
	if user.Credits < input.Total {
		tx.Rollback()
		c.JSON(400, gin.H{"error": "เครดิตไม่พอ! กรุณาเติมเงินที่ธนาคารกลาง"})
		return
	}

	// 2. Check stock
	for _, item := range input.Items {
		var weapon models.Weapon
		tx.First(&weapon, item.WeaponID)
		if weapon.Stock < item.Quantity {
			tx.Rollback()
			c.JSON(400, gin.H{"error": "สินค้าหมด!"})
			return
		}
	}

	// 3. Deduct credits and update stock
	tx.Model(&user).Update("credits", user.Credits-input.Total)

	newOrder := models.Order{UserID: user.ID, Total: input.Total, Status: "paid", CreatedAt: time.Now()}
	tx.Create(&newOrder)

	for _, item := range input.Items {
		tx.Create(&models.OrderItem{OrderID: newOrder.ID, WeaponID: item.WeaponID, Quantity: item.Quantity})
		tx.Model(&models.Weapon{}).Where("id = ?", item.WeaponID).Update("stock", gorm.Expr("stock - ?", item.Quantity))
	}

	tx.Where("user_id = ?", userID).Delete(&models.CartItem{})
	tx.Commit()

	c.JSON(200, gin.H{"message": "สั่งซื้อสำเร็จ!", "remaining_credits": user.Credits - input.Total})
}

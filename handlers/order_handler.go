package handlers

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/Bannawat01/ec-space/config"
	"github.com/Bannawat01/ec-space/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// ── Request structs ───────────────────────────────────────────────────────────

// CheckoutItem represents a single line in the cart payload.
type CheckoutItem struct {
	WeaponID uint `json:"weapon_id" binding:"required"`
	Quantity int  `json:"quantity"  binding:"required,min=1"`
}

// CheckoutRequest mirrors the JSON body sent by the React cart.
type CheckoutRequest struct {
	Total float64        `json:"total" binding:"required,gt=0"`
	Items []CheckoutItem `json:"items" binding:"required,min=1,dive"`
}

// ── Handlers ──────────────────────────────────────────────────────────────────

// GetOrders returns the authenticated user's order history.
func GetOrders(c *gin.Context) {
	val, _ := c.Get("user_id")
	userID := val.(uint)

	var orders []models.Order
	config.DB.
		Preload("Items.Weapon").
		Where("user_id = ?", userID).
		Order("created_at desc").
		Find(&orders)

	c.JSON(http.StatusOK, orders)
}

// AdminOrderResponse is the shape returned by GetAllOrders.
type AdminOrderResponse struct {
	ID        uint               `json:"id"`
	UserID    uint               `json:"user_id"`
	Username  string             `json:"username"`
	Address   string             `json:"address"`
	Total     float64            `json:"total"`
	Status    string             `json:"status"`
	CreatedAt time.Time          `json:"created_at"`
	Items     []models.OrderItem `json:"items"`
}

// GetAllOrders returns every order in the system (admin only).
func GetAllOrders(c *gin.Context) {
	var orders []models.Order
	config.DB.
		Preload("Items.Weapon").
		Order("created_at desc").
		Find(&orders)

	// Collect unique user IDs
	idSet := make(map[uint]struct{}, len(orders))
	for _, o := range orders {
		idSet[o.UserID] = struct{}{}
	}
	userIDs := make([]uint, 0, len(idSet))
	for id := range idSet {
		userIDs = append(userIDs, id)
	}

	var users []models.User
	config.DB.Where("id IN ?", userIDs).Find(&users)

	userMap := make(map[uint]models.User, len(users))
	for _, u := range users {
		userMap[u.ID] = u
	}

	result := make([]AdminOrderResponse, len(orders))
	for i, o := range orders {
		u := userMap[o.UserID]
		result[i] = AdminOrderResponse{
			ID:        o.ID,
			UserID:    o.UserID,
			Username:  u.Username,
			Address:   u.Address,
			Total:     o.Total,
			Status:    o.Status,
			CreatedAt: o.CreatedAt,
			Items:     o.Items,
		}
	}

	c.JSON(http.StatusOK, result)
}

// CreateOrder executes the full checkout flow inside a single atomic transaction.
//
// Flow:
//  1. Bind and validate the request payload.
//  2. BEGIN transaction.
//  3. SELECT user FOR UPDATE  → lock row, prevent concurrent credit drain.
//  4. Validate credits >= total.
//  5. SELECT weapons FOR UPDATE → lock rows, prevent concurrent oversell.
//  6. Validate every item has sufficient stock.
//  7. UPDATE users SET credits = credits - total.
//  8. INSERT orders record.
//  9. INSERT order_items + UPDATE weapons SET stock = stock - qty  (per item).
//  10. DELETE cart_items for this user.
//  11. COMMIT.
func CreateOrder(c *gin.Context) {
	// ── 0. Resolve authenticated user ────────────────────────────────────────
	val, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := val.(uint)

	// ── 1. Bind + validate payload ───────────────────────────────────────────
	var req CheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload: " + err.Error()})
		return
	}

	// ── 2. Begin transaction ─────────────────────────────────────────────────
	tx := config.DB.Begin()
	if tx.Error != nil {
		log.Printf("[CHECKOUT] begin tx failed: %v", tx.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not start transaction"})
		return
	}

	// Safety net: rollback on any unhandled panic so the connection is returned.
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.Printf("[CHECKOUT] panic recovered — rolled back: %v", r)
		}
	}()

	// ── 3. Lock user row (SELECT … FOR UPDATE) ────────────────────────────────
	var user models.User
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		First(&user, userID).Error; err != nil {
		tx.Rollback()
		log.Printf("[CHECKOUT] user lock failed (uid=%d): %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user account"})
		return
	}

	// ── 4. Credit check ───────────────────────────────────────────────────────
	if user.Credits < req.Total {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "เครดิตไม่พอ! กรุณาเติมเงินที่ธนาคารกลาง",
			"have":  user.Credits,
			"need":  req.Total,
		})
		return
	}

	// ── 5. Lock weapon rows (SELECT … FOR UPDATE) ─────────────────────────────
	weaponIDs := make([]uint, len(req.Items))
	for i, it := range req.Items {
		weaponIDs[i] = it.WeaponID
	}

	var weapons []models.Weapon
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("id IN ?", weaponIDs).
		Find(&weapons).Error; err != nil {
		tx.Rollback()
		log.Printf("[CHECKOUT] weapon lock failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch weapon data"})
		return
	}

	// Index weapons by ID for O(1) lookup.
	weaponMap := make(map[uint]models.Weapon, len(weapons))
	for _, w := range weapons {
		weaponMap[w.ID] = w
	}

	// ── 6. Stock validation ───────────────────────────────────────────────────
	for _, it := range req.Items {
		w, ok := weaponMap[it.WeaponID]
		if !ok {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("weapon #%d not found", it.WeaponID),
			})
			return
		}
		if w.Stock < it.Quantity {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{
				"error":     fmt.Sprintf("'%s' มีสินค้าไม่พอ", w.Name),
				"available": w.Stock,
				"requested": it.Quantity,
			})
			return
		}
	}

	// ── 7. Deduct credits ─────────────────────────────────────────────────────
	newCredits := user.Credits - req.Total
	if err := tx.Model(&user).Update("credits", newCredits).Error; err != nil {
		tx.Rollback()
		log.Printf("[CHECKOUT] credit deduction failed (uid=%d): %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to deduct credits"})
		return
	}

	// ── 8. Create order header ────────────────────────────────────────────────
	order := models.Order{
		UserID:    userID,
		Total:     req.Total,
		Status:    "paid",
		CreatedAt: time.Now(),
	}
	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		log.Printf("[CHECKOUT] order create failed (uid=%d): %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order record"})
		return
	}

	// ── 9. Insert order items + deduct stock ──────────────────────────────────
	for _, it := range req.Items {
		item := models.OrderItem{
			OrderID:  order.ID,
			WeaponID: it.WeaponID,
			Quantity: it.Quantity,
		}
		if err := tx.Create(&item).Error; err != nil {
			tx.Rollback()
			log.Printf("[CHECKOUT] order item insert failed (wid=%d): %v", it.WeaponID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record order items"})
			return
		}

		if err := tx.Model(&models.Weapon{}).
			Where("id = ?", it.WeaponID).
			Update("stock", gorm.Expr("stock - ?", it.Quantity)).Error; err != nil {
			tx.Rollback()
			log.Printf("[CHECKOUT] stock deduction failed (wid=%d): %v", it.WeaponID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update weapon stock"})
			return
		}
	}

	// ── 10. Clear user cart ───────────────────────────────────────────────────
	if err := tx.Where("user_id = ?", userID).Delete(&models.CartItem{}).Error; err != nil {
		tx.Rollback()
		log.Printf("[CHECKOUT] cart clear failed (uid=%d): %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
		return
	}

	// ── 11. Commit ────────────────────────────────────────────────────────────
	if err := tx.Commit().Error; err != nil {
		log.Printf("[CHECKOUT] commit failed (uid=%d): %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
		return
	}

	log.Printf("[CHECKOUT] OK — order #%d | user #%d | total %.2f CR | remaining %.2f CR",
		order.ID, userID, req.Total, newCredits)

	c.JSON(http.StatusOK, gin.H{
		"message":           "สั่งซื้อสำเร็จ!",
		"order_id":          order.ID,
		"total":             req.Total,
		"remaining_credits": newCredits,
	})
}

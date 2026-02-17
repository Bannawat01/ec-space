package main // ยืนยันว่าเป็น package main

import (
	"time"

	"github.com/gin-gonic/gin"
)

func CreateOrder(c *gin.Context) {
	var input struct {
		Total float64     `json:"total"`
		Items []OrderItem `json:"items"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// ดึง userID จาก Token
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(401, gin.H{"error": "กรุณาเข้าสู่ระบบ"})
		return
	}

	newOrder := Order{
		UserID:    userID.(uint),
		Total:     input.Total,
		Status:    "pending",
		CreatedAt: time.Now(),
		Items:     input.Items,
	}

	// ใช้ DB ตัวพิมพ์ใหญ่จาก database.go
	DB.Create(&newOrder)

	c.JSON(200, gin.H{"message": "สั่งซื้อสำเร็จ!", "order_id": newOrder.ID})
}

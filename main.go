package main

import (
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/Bannawat01/ec-space/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var jwtKey = []byte("galactic_secret_key_99")

// 🆕 Model สำหรับ CartItem เพื่อเก็บตะกร้าลง Database ผูกกับ UserID

func main() {
	InitDB()
	// ✅ AutoMigrate ตารางทั้งหมด
	DB.AutoMigrate(&Weapon{}, &User{}, &Order{}, &OrderItem{}, &CartItem{})

	if _, err := os.Stat("uploads"); os.IsNotExist(err) {
		os.Mkdir("uploads", os.ModePerm)
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// --- [กลุ่มที่ 1] API สาธารณะ ---
	r.GET("/api/weapons", func(c *gin.Context) {
		var weapons []Weapon
		DB.Find(&weapons)
		c.JSON(http.StatusOK, weapons)
	})

	r.POST("/api/register", func(c *gin.Context) {
		var user User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
			return
		}
		user.Role = "user"
		if user.Username == "admin_boss" {
			user.Role = "admin"
		}
		// กำหนดเครดิตเริ่มต้นสำหรับผู้ใช้ใหม่
		user.Credits = 10000
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), 10)
		user.Password = string(hashedPassword)
		DB.Create(&user)
		c.JSON(http.StatusCreated, gin.H{"message": "ลงทะเบียนสำเร็จ!"})
	})

	r.POST("/api/login", func(c *gin.Context) {
		var input struct {
			Username string `json:"username" binding:"required"`
			Password string `json:"password" binding:"required"`
		}
		var user User
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณากรอกข้อมูลให้ครบ"})
			return
		}
		if err := DB.Where("username = ?", input.Username).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "ไม่พบผู้ใช้"})
			return
		}
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "รหัสผ่านไม่ถูกต้อง"})
			return
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id": user.ID,
			"role":    user.Role,
			"exp":     time.Now().Add(time.Hour * 24).Unix(),
		})
		tokenString, _ := token.SignedString(jwtKey)
		c.JSON(http.StatusOK, gin.H{"token": tokenString, "role": user.Role})
	})

	// --- [กลุ่มที่ 2] API สำหรับ User (ระบบตะกร้าถาวร + สั่งซื้อ + โปรไฟล์) ---
	auth := r.Group("/api")
	auth.Use(middleware.AuthMiddleware(jwtKey))
	{
		// 📜 API สำหรับดึงประวัติการสั่งซื้อย้อนหลัง
		auth.GET("/orders", func(c *gin.Context) {
			val, _ := c.Get("user_id")
			userID := val.(uint)

			var orders []Order
			// ✅ แก้ไขการ Preload เป็น "Items.Weapon" เพื่อดึงข้อมูลอาวุธในรายการย่อย
			DB.Preload("Items.Weapon").Where("user_id = ?", userID).Order("created_at desc").Find(&orders)

			c.JSON(http.StatusOK, orders)
		})

		auth.POST("/topup", func(c *gin.Context) {
			val, exists := c.Get("user_id")
			if !exists || val == nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "เซสชันหมดอายุ กรุณาล็อกอินใหม่"})
				return
			}
			userID := val.(uint)

			var input struct {
				Amount float64 `json:"amount"` // ยอดเงินที่เลือกเติม
			}
			if err := c.ShouldBindJSON(&input); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลการเติมเงินไม่ถูกต้อง"})
				return
			}

			// อัปเดตยอดเงินในฐานข้อมูลโดยการบวกเพิ่มจากของเดิม
			if err := DB.Model(&User{}).Where("id = ?", userID).
				Update("credits", gorm.Expr("credits + ?", input.Amount)).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "ระบบธนาคารกลางขัดข้อง"})
				return
			}

			// ดึงยอดเงินใหม่กลับไปแสดงผล
			var user User
			DB.First(&user, userID)

			c.JSON(http.StatusOK, gin.H{
				"message":     "เติมเครดิตสำเร็จ!",
				"new_balance": user.Credits,
			})
		})

		// 🆕 API ดึงข้อมูลโปรไฟล์ (ใช้สำหรับ Navbar เพื่อโชว์ Credits)
		auth.GET("/profile", func(c *gin.Context) {
			val, exists := c.Get("user_id")
			if !exists || val == nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "กรุณาเข้าสู่ระบบใหม่"})
				return
			}
			userID := val.(uint)
			var user User
			if err := DB.First(&user, userID).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลผู้ใช้"})
				return
			}
			c.JSON(http.StatusOK, gin.H{
				"id":       user.ID,
				"username": user.Username,
				"credits":  user.Credits,
				"role":     user.Role,
			})
		})

		auth.GET("/cart", func(c *gin.Context) {
			val, exists := c.Get("user_id")
			if !exists || val == nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "กรุณาเข้าสู่ระบบใหม่"})
				return
			}
			userID := val.(uint)
			var items []CartItem
			DB.Preload("Weapon").Where("user_id = ?", userID).Find(&items)
			c.JSON(200, items)
		})

		auth.POST("/cart", func(c *gin.Context) {
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

			var cartItem CartItem
			err := DB.Where("user_id = ? AND weapon_id = ?", userID, input.WeaponID).First(&cartItem).Error

			if err == nil {
				DB.Model(&cartItem).Update("quantity", cartItem.Quantity+input.Quantity)
			} else {
				DB.Create(&CartItem{
					UserID:   userID,
					WeaponID: input.WeaponID,
					Quantity: input.Quantity,
				})
			}
			c.JSON(http.StatusOK, gin.H{"message": "บันทึกตะกร้าสำเร็จ"})
		})

		auth.DELETE("/cart/:weapon_id", func(c *gin.Context) {
			val, exists := c.Get("user_id")
			if !exists || val == nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
				return
			}
			userID := val.(uint)
			weaponID := c.Param("weapon_id")
			DB.Where("user_id = ? AND weapon_id = ?", userID, weaponID).Delete(&CartItem{})
			c.JSON(200, gin.H{"message": "ลบสำเร็จ"})
		})

		// 💳 ยืนยันการสั่งซื้อ ตัดเงินเครดิต และสต็อก
		auth.POST("/orders", func(c *gin.Context) {
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

			tx := DB.Begin()

			// 1. ตรวจสอบเงินเครดิต
			var user User
			tx.First(&user, userID)
			if user.Credits < input.Total {
				tx.Rollback()
				c.JSON(400, gin.H{"error": "เครดิตไม่พอ! กรุณาเติมเงินที่ธนาคารกลาง"})
				return
			}

			// 2. ตรวจสอบสต็อก
			for _, item := range input.Items {
				var weapon Weapon
				tx.First(&weapon, item.WeaponID)
				if weapon.Stock < item.Quantity {
					tx.Rollback()
					c.JSON(400, gin.H{"error": "สินค้าหมด!"})
					return
				}
			}

			// 3. ตัดเงิน และ อัปเดตสต็อก
			tx.Model(&user).Update("credits", user.Credits-input.Total)

			newOrder := Order{UserID: user.ID, Total: input.Total, Status: "paid", CreatedAt: time.Now()}
			tx.Create(&newOrder)

			for _, item := range input.Items {
				tx.Create(&OrderItem{OrderID: newOrder.ID, WeaponID: item.WeaponID, Quantity: item.Quantity})
				tx.Model(&Weapon{}).Where("id = ?", item.WeaponID).Update("stock", gorm.Expr("stock - ?", item.Quantity))
			}

			tx.Where("user_id = ?", userID).Delete(&CartItem{})
			tx.Commit()

			c.JSON(200, gin.H{"message": "สั่งซื้อสำเร็จ!", "remaining_credits": user.Credits - input.Total})
		})
	}

	// --- [กลุ่มที่ 3] API สำหรับ ADMIN ---
	admin := r.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware(jwtKey))
	admin.Use(middleware.AdminMiddleware(jwtKey))
	{
		admin.POST("/weapons", func(c *gin.Context) {
			name := c.PostForm("name")
			weaponType := c.PostForm("type")
			price := c.PostForm("price")
			stock := c.PostForm("stock")
			description := c.PostForm("description")
			file, err := c.FormFile("image")
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาแนบไฟล์ภาพ"})
				return
			}
			newFileName := uuid.New().String() + filepath.Ext(file.Filename)
			imagePath := "uploads/" + newFileName
			c.SaveUploadedFile(file, imagePath)

			newWeapon := Weapon{
				Name:        name,
				Type:        weaponType,
				Price:       ToFloat64(price),
				Stock:       ToInt(stock),
				Description: description,
				ImageURL:    imagePath,
			}
			DB.Create(&newWeapon)
			c.JSON(http.StatusCreated, gin.H{"message": "เพิ่มอาวุธสำเร็จ!"})
		})

		admin.PATCH("/weapons/:id", func(c *gin.Context) {
			id := c.Param("id")
			var weapon Weapon
			if err := DB.First(&weapon, id).Error; err != nil {
				c.JSON(404, gin.H{"error": "ไม่พบอาวุธ"})
				return
			}
			if v := c.PostForm("name"); v != "" {
				weapon.Name = v
			}
			if v := c.PostForm("price"); v != "" {
				weapon.Price = ToFloat64(v)
			}
			if v := c.PostForm("stock"); v != "" {
				weapon.Stock = ToInt(v)
			}
			if v := c.PostForm("description"); v != "" {
				weapon.Description = v
			}

			file, err := c.FormFile("image")
			if err == nil {
				newFileName := uuid.New().String() + filepath.Ext(file.Filename)
				imagePath := "uploads/" + newFileName
				c.SaveUploadedFile(file, imagePath)
				weapon.ImageURL = imagePath
			}
			DB.Save(&weapon)
			c.JSON(200, gin.H{"message": "อัปเดตสำเร็จ!"})
		})

		admin.DELETE("/weapons/:id", func(c *gin.Context) {
			DB.Delete(&Weapon{}, c.Param("id"))
			c.JSON(200, gin.H{"message": "ลบอาวุธเรียบร้อย"})
		})
	}

	r.Static("/uploads", "./uploads")
	r.Run(":8080")
}

func ToFloat64(s string) float64 { val, _ := strconv.ParseFloat(s, 64); return val }
func ToInt(s string) int         { val, _ := strconv.Atoi(s); return val }

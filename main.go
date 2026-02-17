package main

import (
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/Bannawat01/ec-space/middleware" // เรียกใช้ middleware ที่เราแยกไว้
	"github.com/Bannawat01/ec-space/service"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte("galactic_secret_key_99")

func main() {
	db := InitDB()
	db.AutoMigrate(&Weapon{}, &User{}, &Order{})

	if _, err := os.Stat("uploads"); os.IsNotExist(err) {
		os.Mkdir("uploads", os.ModePerm)
	}

	r := gin.Default()

	// --- กลุ่ม API ที่ต้องผ่านด่านตรวจ (Protected) ---
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware(jwtKey))
	{
		// เพิ่มอาวุธ (ต้องมี Token)
		protected.POST("/weapons", func(c *gin.Context) {
			name := c.PostForm("name")
			weaponType := c.PostForm("type")
			description := c.PostForm("description")

			file, err := c.FormFile("image")
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาแนบไฟล์ภาพ"})
				return
			}

			if !service.IsAllowedExtension(file.Filename) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "ไฟล์ไม่ได้รับอนุญาต"})
				return
			}

			newFileName := uuid.New().String() + filepath.Ext(file.Filename)
			imagePath := "uploads/" + newFileName

			if err := c.SaveUploadedFile(file, imagePath); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกไฟล์ไม่สำเร็จ"})
				return
			}

			newWeapon := Weapon{
				Name:        name,
				Type:        weaponType,
				Description: description,
				ImageURL:    imagePath,
			}
			db.Create(&newWeapon)

			c.JSON(http.StatusCreated, gin.H{"message": "เพิ่มอาวุธเรียบร้อย!", "data": newWeapon})
		})
	}

	// --- กลุ่ม API ทั่วไป (Public) ---
	r.GET("/api/weapons", func(c *gin.Context) {
		var weapons []Weapon
		db.Find(&weapons)
		c.JSON(http.StatusOK, weapons)
	})

	r.POST("/api/register", func(c *gin.Context) {
		var user User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
			return
		}
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), 10)
		user.Password = string(hashedPassword)
		db.Create(&user)
		c.JSON(http.StatusCreated, gin.H{"message": "ลงทะเบียนสำเร็จ!"})
	})

	r.POST("/api/login", func(c *gin.Context) {
		var input struct {
			Username string `json:"username" binding:"required"`
			Password string `json:"password" binding:"required"`
		}
		var user User

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณากรอก Username และ Password"})
			return
		}

		if err := db.Where("username = ?", input.Username).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "ไม่พบผู้ใช้"})
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "รหัสผ่านไม่ถูกต้อง"})
			return
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id": user.ID,
			"exp":     time.Now().Add(time.Hour * 24).Unix(),
		})

		tokenString, _ := token.SignedString(jwtKey)
		c.JSON(http.StatusOK, gin.H{"token": tokenString})
	})

	r.Static("/uploads", "./uploads")
	r.Run(":8080")
}

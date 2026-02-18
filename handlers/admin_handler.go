package handlers

import (
	"net/http"
	"path/filepath"

	"github.com/Bannawat01/ec-space/config"
	"github.com/Bannawat01/ec-space/models"
	"github.com/Bannawat01/ec-space/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// AddWeapon - Admin creates new weapon
func AddWeapon(c *gin.Context) {
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

	newWeapon := models.Weapon{
		Name:        name,
		Type:        weaponType,
		Price:       utils.ToFloat64(price),
		Stock:       utils.ToInt(stock),
		Description: description,
		ImageURL:    imagePath,
	}

	config.DB.Create(&newWeapon)
	c.JSON(http.StatusCreated, gin.H{"message": "เพิ่มอาวุธสำเร็จ!"})
}

// UpdateWeapon - Admin updates weapon
func UpdateWeapon(c *gin.Context) {
	id := c.Param("id")
	var weapon models.Weapon

	if err := config.DB.First(&weapon, id).Error; err != nil {
		c.JSON(404, gin.H{"error": "ไม่พบอาวุธ"})
		return
	}

	if v := c.PostForm("name"); v != "" {
		weapon.Name = v
	}
	if v := c.PostForm("price"); v != "" {
		weapon.Price = utils.ToFloat64(v)
	}
	if v := c.PostForm("stock"); v != "" {
		weapon.Stock = utils.ToInt(v)
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

	config.DB.Save(&weapon)
	c.JSON(200, gin.H{"message": "อัปเดตสำเร็จ!"})
}

// DeleteWeapon - Admin deletes weapon
func DeleteWeapon(c *gin.Context) {
	config.DB.Delete(&models.Weapon{}, c.Param("id"))
	c.JSON(200, gin.H{"message": "ลบอาวุธเรียบร้อย"})
}

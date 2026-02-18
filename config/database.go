package config

import (
	"fmt"

	"github.com/Bannawat01/ec-space/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dsn := "host=localhost user=galaxy_admin password=super_secret_password dbname=weapon_store port=5432 sslmode=disable"
	var err error

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		panic("Failed to connect to intergalactic database!")
	}

	// AutoMigrate all models
	DB.AutoMigrate(&models.Weapon{}, &models.User{}, &models.Order{}, &models.OrderItem{}, &models.CartItem{})

	fmt.Println("🚀 Database Connected and Migrated Successfully!")
}

func GetDB() *gorm.DB {
	return DB
}

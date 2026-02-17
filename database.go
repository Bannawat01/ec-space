package main

import (
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// นิยามข้อมูลอาวุธ
type Weapon struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	Name        string  `json:"name" binding:"required"`
	Type        string  `json:"type" binding:"required"`
	PowerLevel  int     `json:"power_level"`
	Price       float64 `json:"price" binding:"required"`
	Description string  `json:"description"`
	ImageURL    string  `json:"image_url"`
}

type CheckoutRequest struct {
	WeaponID uint   `json:"weapon_id"`
	Token    string `json:"token"` // Token ที่ได้จากหน้าบ้าน (Frontend)
}

// ข้อมูลผู้ใช้งาน
type User struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Username string `gorm:"unique;not null" json:"username" binding:"required"`
	Email    string `gorm:"unique;not null" json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"` // ตอนรับค่า Register
}

// ข้อมูลการสั่งซื้อ (เชื่อมโยง User และ Weapon)
type Order struct {
	ID       uint    `gorm:"primaryKey" json:"id"`
	UserID   uint    `json:"user_id"`
	User     User    `gorm:"foreignKey:UserID"`
	WeaponID uint    `json:"weapon_id"`
	Weapon   Weapon  `gorm:"foreignKey:WeaponID"`
	Status   string  `json:"status"` // เช่น Pending, Completed, Failed
	Total    float64 `json:"total"`
}

func InitDB() *gorm.DB {
	dsn := "host=localhost user=galaxy_admin password=super_secret_password dbname=weapon_store port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to intergalactic database!")
	}
	fmt.Println("🚀 Database Connected Successfully!")
	return db
}

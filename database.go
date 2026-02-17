package main

import (
	"fmt"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB เป็นตัวแปร Global สำหรับจัดการฐานข้อมูล (เปลี่ยนเป็นตัวพิมพ์ใหญ่เพื่อให้ไฟล์อื่นมองเห็น)
var DB *gorm.DB

// --- โครงสร้างข้อมูล (Models) ---

// ข้อมูลอาวุธ
type Weapon struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	Name        string  `json:"name" binding:"required"`
	Type        string  `json:"type" binding:"required"`
	PowerLevel  int     `json:"power_level"`
	Price       float64 `json:"price" binding:"required"`
	Description string  `json:"description"`
	Stock       int     `json:"stock"`
	ImageURL    string  `json:"image_url"`
}

// ข้อมูลผู้ใช้งาน
type User struct {
	ID       uint    `gorm:"primaryKey"`
	Username string  `gorm:"unique"`
	Role     string  `gorm:"default:user"` // "admin" หรือ "user" สำหรับแบ่งสิทธิ์
	Email    string  `gorm:"unique;not null" json:"email" binding:"required,email"`
	Password string  `json:"password" binding:"required"`
	Credits  float64 `gorm:"default:0"`
}

// ข้อมูลการสั่งซื้อ (เชื่อมโยง User และ Weapon)
type Order struct {
	ID        uint        `json:"id" gorm:"primaryKey"`
	UserID    uint        `json:"user_id"`
	Total     float64     `json:"total"`
	Status    string      `json:"status"`
	CreatedAt time.Time   `json:"created_at"` // ต้องการ import "time"
	Items     []OrderItem `json:"items"`
}

type OrderItem struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	OrderID  uint   `json:"order_id"`
	WeaponID uint   `json:"weapon_id"`
	Quantity int    `json:"quantity"`
	Weapon   Weapon `gorm:"foreignKey:WeaponID" json:"weapon"` // ✅ ต้องมีบรรทัดนี้
}

type CartItem struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	UserID   uint   `gorm:"not null" json:"user_id"`
	WeaponID uint   `gorm:"not null" json:"weapon_id"`
	Quantity int    `gorm:"default:1" json:"quantity"`
	Weapon   Weapon `gorm:"foreignKey:WeaponID" json:"weapon"`
}

// สำหรับรับค่า Request จากหน้าบ้าน
type CheckoutRequest struct {
	WeaponID uint   `json:"weapon_id"`
	Token    string `json:"token"`
}

// --- ฟังก์ชันจัดการฐานข้อมูล ---

func InitDB() {
	dsn := "host=localhost user=galaxy_admin password=super_secret_password dbname=weapon_store port=5432 sslmode=disable"
	var err error

	// กำหนดค่าให้กับตัวแปร DB (Global)
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		panic("Failed to connect to intergalactic database!")
	}

	// สั่งให้ Database อัปเดตตารางตามที่เราเขียนไว้ด้านบนอัตโนมัติ
	DB.AutoMigrate(&Weapon{}, &User{}, &Order{}, &OrderItem{})

	fmt.Println("🚀 Database Connected and Migrated Successfully!")
}

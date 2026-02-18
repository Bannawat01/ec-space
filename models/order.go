package models

import "time"

type Order struct {
	ID        uint        `json:"id" gorm:"primaryKey"`
	UserID    uint        `json:"user_id"`
	Total     float64     `json:"total"`
	Status    string      `json:"status"`
	CreatedAt time.Time   `json:"created_at"`
	Items     []OrderItem `json:"items"`
}

type OrderItem struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	OrderID  uint   `json:"order_id"`
	WeaponID uint   `json:"weapon_id"`
	Quantity int    `json:"quantity"`
	Weapon   Weapon `gorm:"foreignKey:WeaponID" json:"weapon"`
}

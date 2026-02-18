package models

type CartItem struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	UserID   uint   `gorm:"not null" json:"user_id"`
	WeaponID uint   `gorm:"not null" json:"weapon_id"`
	Quantity int    `gorm:"default:1" json:"quantity"`
	Weapon   Weapon `gorm:"foreignKey:WeaponID" json:"weapon"`
}

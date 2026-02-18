package models

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

package models

type User struct {
	ID       uint    `gorm:"primaryKey"`
	Username string  `gorm:"unique" json:"username" binding:"required"`
	Role     string  `gorm:"default:user" json:"role"`
	Email    string  `gorm:"unique;not null" json:"email" binding:"required"`
	Password string  `json:"password" binding:"required"`
	Credits  float64 `gorm:"default:0" json:"credits"`
}

package models

type User struct {
	ID       uint    `gorm:"primaryKey"`
	Username string  `gorm:"unique"`
	Role     string  `gorm:"default:user"`
	Email    string  `gorm:"unique;not null" json:"email" binding:"required,email"`
	Password string  `json:"password" binding:"required"`
	Credits  float64 `gorm:"default:0"`
}

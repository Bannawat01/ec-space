package main

import (
	"os"
	"time" // เพิ่มอันนี้

	"github.com/Bannawat01/ec-space/config"
	"github.com/Bannawat01/ec-space/routes"
	"github.com/gin-contrib/cors" // เพิ่มอันนี้ (ถ้าแดงให้รัน go get github.com/gin-contrib/cors)
	"github.com/gin-gonic/gin"
)

func main() {
	config.InitDB()

	if _, err := os.Stat("uploads"); os.IsNotExist(err) {
		os.Mkdir("uploads", os.ModePerm)
	}

	r := gin.Default()

	// --- ต้องวางก้อนนี้ "ก่อน" routes.SetupRoutes(r) ---
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5174"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	// ------------------------------------------------

	routes.SetupRoutes(r)

	r.Run(":8080")
}
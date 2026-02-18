package main

import (
	"os"

	"github.com/Bannawat01/ec-space/config"
	"github.com/Bannawat01/ec-space/routes"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	config.InitDB()

	// Create uploads folder if not exists
	if _, err := os.Stat("uploads"); os.IsNotExist(err) {
		os.Mkdir("uploads", os.ModePerm)
	}

	// Setup Gin router
	r := gin.Default()

	// Setup all routes
	routes.SetupRoutes(r)

	// Start server
	r.Run(":8080")
}

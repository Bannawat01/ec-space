package routes

import (
	"time"

	"github.com/Bannawat01/ec-space/handlers"
	"github.com/Bannawat01/ec-space/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// CORS configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Public routes
	r.GET("/api/weapons", handlers.GetWeapons)
	r.POST("/api/register", handlers.Register)
	r.POST("/api/login", handlers.Login)

	// Authenticated routes
	auth := r.Group("/api")
	auth.Use(middleware.AuthMiddleware(handlers.GetJWTKey()))
	{
		// Profile & Topup
		auth.GET("/profile", handlers.GetProfile)
		auth.POST("/topup", handlers.Topup)

		// Cart
		auth.GET("/cart", handlers.GetCart)
		auth.POST("/cart", handlers.AddToCart)
		auth.DELETE("/cart/:weapon_id", handlers.RemoveFromCart)

		// Orders
		auth.GET("/orders", handlers.GetOrders)
		auth.POST("/orders", handlers.CreateOrder)
	}

	// Admin routes
	admin := r.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware(handlers.GetJWTKey()))
	admin.Use(middleware.AdminMiddleware(handlers.GetJWTKey()))
	{
		admin.POST("/weapons", handlers.AddWeapon)
		admin.PATCH("/weapons/:id", handlers.UpdateWeapon)
		admin.DELETE("/weapons/:id", handlers.DeleteWeapon)
	}

	// Static files
	r.Static("/uploads", "./uploads")
}

package routes

import (
	"github.com/Bannawat01/ec-space/handlers"
	"github.com/Bannawat01/ec-space/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// Public routes
	r.GET("/api/weapons", handlers.GetWeapons)
	r.GET("/api/weapons/:id", handlers.GetWeapon)
	r.POST("/api/register", handlers.Register)
	r.POST("/api/login", handlers.Login)

	// Authenticated routes
	auth := r.Group("/api")
	auth.Use(middleware.AuthMiddleware(handlers.GetJWTKey()))
	{
		// Profile & Topup
		auth.GET("/profile", handlers.GetProfile)
		// Allow users to update their profile (address, email)
		auth.PATCH("/profile", handlers.UpdateProfile)
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
		admin.GET("/orders", handlers.GetAllOrders)
	}

	// Static files
	r.Static("/uploads", "./uploads")
}

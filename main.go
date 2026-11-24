package main

import (
	"log"
	"online-store/config"
	"online-store/db"
	"online-store/handler"
	"online-store/middleware"
	"online-store/storage"

	"github.com/gin-gonic/gin"
	"github.com/pressly/goose/v3"
)

func main() {
	cfg := config.Load()

	conn, err := db.ConnectDb(*cfg)
	if err != nil {
		log.Fatalf("failed to connect db: %v\n", err)
	}
	defer conn.Close()

	if err := goose.SetDialect("postgres"); err != nil {
		log.Fatalf("failed to goose set: %v\n", err)
	}

	if err := goose.Up(conn, "migrations"); err != nil {
		log.Fatal(err)
	}

	strg := storage.NewStorage(conn)
	h := handler.NewHandler(strg)

	route := gin.New()
	_ = route.SetTrustedProxies(nil)

	// Middlewares
	route.Use(middleware.CORSMiddleware())
	route.Use(middleware.LoggerMiddleware())
	route.Use(middleware.RecoveryMiddleware())

	// Auth
	auth := route.Group("/auth")
	{
		auth.POST("/login", h.Login)
		auth.GET("/profile", middleware.AuthMiddleware(), h.GetProfile)
	}

	// Categories CRUD
	category := route.Group("/categories")
	{
		category.GET("/", h.GetAllCategories)
		category.GET("/:id", h.GetCategoryByID)
		category.POST("/", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN", "MANAGER"), h.CreateCategory)
		category.PUT("/:id", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN", "MANAGER"), h.UpdateCategory)
		category.DELETE("/:id", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN"), h.DeleteCategory)
	}

	// Products CRUD
	product := route.Group("/products")
	{
		product.GET("/", h.GetAllProducts)
		product.GET("/:id", h.GetProductByID)
		product.POST("/", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN", "MANAGER"), h.CreateProduct)
		product.PUT("/:id", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN", "MANAGER"), h.UpdateProduct)
		product.DELETE("/:id", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN"), h.DeleteProduct)
	}

	// Customers CRUD
	customer := route.Group("/customers")
	customer.Use(middleware.OptionalAuthMiddleware())
	{
		customer.GET("/", h.GetAllCustomers)
		customer.GET("/:id", h.GetCustomerByID)
		customer.POST("/", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN", "MANAGER", "CASHIER"), h.CreateCustomer)
		customer.PUT("/:id", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN", "MANAGER", "CASHIER"), h.UpdateCustomer)
		customer.DELETE("/:id", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN"), h.DeleteCustomer)
	}

	// Employees CRUD (RBAC: Only Admin & Manager can view, only Admin can modify)
	employee := route.Group("/employees")
	employee.Use(middleware.AuthMiddleware())
	{
		employee.GET("/", middleware.RequireRole("ADMIN", "MANAGER"), h.GetAllEmployees)
		employee.GET("/:id", middleware.RequireRole("ADMIN", "MANAGER"), h.GetEmployeeByID)
		employee.POST("/", middleware.RequireRole("ADMIN"), h.CreateEmployee)
		employee.PUT("/:id", middleware.RequireRole("ADMIN"), h.UpdateEmployee)
		employee.DELETE("/:id", middleware.RequireRole("ADMIN"), h.DeleteEmployee)
	}

	// Sales CRUD
	sale := route.Group("/sales")
	sale.Use(middleware.OptionalAuthMiddleware())
	{
		sale.GET("/", h.GetAllSales)
		sale.GET("/:id", h.GetSaleByID)
		sale.POST("/checkout", h.CreateSaleWithItems)
		sale.POST("/", h.CreateSale)
		sale.PUT("/:id", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN", "MANAGER"), h.UpdateSale)
		sale.DELETE("/:id", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN"), h.DeleteSale)
	}

	// Sale Items CRUD
	saleItem := route.Group("/sale-items")
	saleItem.Use(middleware.OptionalAuthMiddleware())
	{
		saleItem.GET("/", h.GetAllSaleItems)
		saleItem.GET("/:id", h.GetSaleItemByID)
		saleItem.POST("/", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN", "MANAGER", "CASHIER"), h.CreateSaleItem)
		saleItem.PUT("/:id", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN", "MANAGER"), h.UpdateSaleItem)
		saleItem.DELETE("/:id", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN"), h.DeleteSaleItem)
	}

	// Payments CRUD
	payment := route.Group("/payments")
	payment.Use(middleware.OptionalAuthMiddleware())
	{
		payment.GET("/", h.GetAllPayments)
		payment.GET("/:id", h.GetPaymentByID)
		payment.POST("/", h.CreatePayment)
		payment.PUT("/:id", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN", "MANAGER"), h.UpdatePayment)
		payment.DELETE("/:id", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN"), h.DeletePayment)
	}

	if err := route.Run(":8080"); err != nil {
		log.Fatalf("Failed to run route: %v\n", err)
	}
}

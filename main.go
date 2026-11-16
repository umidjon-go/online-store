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

	// Middlewares
	route.Use(middleware.CORSMiddleware())
	route.Use(middleware.LoggerMiddleware())
	route.Use(middleware.RecoveryMiddleware())

	// Categories CRUD
	category := route.Group("/categories")
	{
		category.POST("/", h.CreateCategory)
		category.GET("/:id", h.GetCategoryByID)
		category.GET("/", h.GetAllCategories)
		category.PUT("/:id", h.UpdateCategory)
		category.DELETE("/:id", h.DeleteCategory)
	}

	// Products CRUD
	product := route.Group("/products")
	{
		product.POST("/", h.CreateProduct)
		product.GET("/:id", h.GetProductByID)
		product.GET("/", h.GetAllProducts)
		product.PUT("/:id", h.UpdateProduct)
		product.DELETE("/:id", h.DeleteProduct)
	}

	// Customers CRUD
	customer := route.Group("/customers")
	{
		customer.POST("/", h.CreateCustomer)
		customer.GET("/:id", h.GetCustomerByID)
		customer.GET("/", h.GetAllCustomers)
		customer.PUT("/:id", h.UpdateCustomer)
		customer.DELETE("/:id", h.DeleteCustomer)
	}

	// Employees CRUD
	employee := route.Group("/employees")
	{
		employee.POST("/", h.CreateEmployee)
		employee.GET("/:id", h.GetEmployeeByID)
		employee.GET("/", h.GetAllEmployees)
		employee.PUT("/:id", h.UpdateEmployee)
		employee.DELETE("/:id", h.DeleteEmployee)
	}

	// Sales CRUD
	sale := route.Group("/sales")
	{
		sale.POST("/checkout", h.CreateSaleWithItems)
		sale.POST("/", h.CreateSale)
		sale.GET("/:id", h.GetSaleByID)
		sale.GET("/", h.GetAllSales)
		sale.PUT("/:id", h.UpdateSale)
		sale.DELETE("/:id", h.DeleteSale)
	}

	// Sale Items CRUD
	saleItem := route.Group("/sale-items")
	{
		saleItem.POST("/", h.CreateSaleItem)
		saleItem.GET("/:id", h.GetSaleItemByID)
		saleItem.GET("/", h.GetAllSaleItems)
		saleItem.PUT("/:id", h.UpdateSaleItem)
		saleItem.DELETE("/:id", h.DeleteSaleItem)
	}

	// Payments CRUD
	payment := route.Group("/payments")
	{
		payment.POST("/", h.CreatePayment)
		payment.GET("/:id", h.GetPaymentByID)
		payment.GET("/", h.GetAllPayments)
		payment.PUT("/:id", h.UpdatePayment)
		payment.DELETE("/:id", h.DeletePayment)
	}

	if err := route.Run(":8080"); err != nil {
		log.Fatalf("Failed to run route: %v\n", err)
	}
}

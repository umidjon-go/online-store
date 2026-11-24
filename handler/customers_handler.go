package handler

import (
	"net/http"
	"online-store/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (h *Handler) CreateCustomer(c *gin.Context) {
	var body models.Customer
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Agar so'rov yuborgan xodim mavjud bo'lsa, mijozga uni biriktiramiz
	if empIDVal, exists := c.Get("employee_id"); exists {
		if empID, ok := empIDVal.(int64); ok && empID > 0 {
			body.CreatedBy = &empID
		}
	}

	resp, err := h.storage.CreateCustomer(body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

func (h *Handler) GetCustomerByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid customer id"})
		return
	}

	// Agar foydalanuvchi KASSIR bo'lsa, faqat o'ziga tegishli mijozni ko'ra oladi
	var cashierFilter *int64
	if roleVal, exists := c.Get("role"); exists && roleVal == "CASHIER" {
		if empIDVal, ok := c.Get("employee_id"); ok {
			if empID, okID := empIDVal.(int64); okID && empID > 0 {
				cashierFilter = &empID
			}
		}
	}

	resp, err := h.storage.GetCustomerByID(id, cashierFilter)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) GetAllCustomers(c *gin.Context) {
	// Agar foydalanuvchi KASSIR bo'lsa, faqat o'ziga tegishli mijozlarni ko'radi
	var cashierFilter *int64
	if roleVal, exists := c.Get("role"); exists && roleVal == "CASHIER" {
		if empIDVal, ok := c.Get("employee_id"); ok {
			if empID, okID := empIDVal.(int64); okID && empID > 0 {
				cashierFilter = &empID
			}
		}
	}

	resp, err := h.storage.GetAllCustomers(cashierFilter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if resp == nil {
		resp = []models.Customer{}
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) UpdateCustomer(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid customer id"})
		return
	}

	var body models.Customer
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	body.Id = id

	resp, err := h.storage.UpdateCustomer(body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) DeleteCustomer(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid customer id"})
		return
	}

	if err := h.storage.DeleteCustomer(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "customer deleted successfully"})
}

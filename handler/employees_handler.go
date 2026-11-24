package handler

import (
	"net/http"
	"online-store/models"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func (h *Handler) CreateEmployee(c *gin.Context) {
	var body models.Employee
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.storage.CreateEmployee(body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

func (h *Handler) GetEmployeeByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid employee id"})
		return
	}

	resp, err := h.storage.GetEmployeeByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Faqat ADMIN parolni ko'ra olsin: agar so'rov yuborgan foydalanuvchi ADMIN bo'lmasa, parolni yashiramiz
	roleVal, _ := c.Get("role")
	callerRole, _ := roleVal.(string)
	isAdmin := strings.EqualFold(callerRole, "ADMIN")

	if !isAdmin {
		resp.Password = ""
		resp.PlainPassword = ""
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) GetAllEmployees(c *gin.Context) {
	resp, err := h.storage.GetAllEmployees()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if resp == nil {
		resp = []models.Employee{}
	}

	// Faqat ADMIN parolni ko'ra olsin: agar so'rov yuborgan foydalanuvchi ADMIN bo'lmasa, parollarni tozalaymiz
	roleVal, _ := c.Get("role")
	callerRole, _ := roleVal.(string)
	isAdmin := strings.EqualFold(callerRole, "ADMIN")

	if !isAdmin {
		for i := range resp {
			resp[i].Password = ""
			resp[i].PlainPassword = ""
		}
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) UpdateEmployee(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid employee id"})
		return
	}

	var body models.Employee
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	body.Id = id

	resp, err := h.storage.UpdateEmployee(body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) DeleteEmployee(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid employee id"})
		return
	}

	if err := h.storage.DeleteEmployee(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "employee deleted successfully"})
}

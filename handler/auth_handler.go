package handler

import (
	"net/http"
	"online-store/models"
	"online-store/pkg/utils"

	"github.com/gin-gonic/gin"
)

// Login xodimni telefon raqami va paroli orqali tekshirib, JWT token qaytaradi
func (h *Handler) Login(c *gin.Context) {
	var req models.LoginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "telefon raqami va parol kiritilishi shart"})
		return
	}

	emp, err := h.storage.GetEmployeeByPhone(req.Phone)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "telefon raqam yoki parol noto'g'ri"})
		return
	}

	if emp.Status != "ACTIVE" {
		c.JSON(http.StatusForbidden, gin.H{"error": "ushbu xodim hisobi faol emas (bloklangan)"})
		return
	}

	if !utils.CheckPasswordHash(req.Password, emp.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "telefon raqam yoki parol noto'g'ri"})
		return
	}

	token, err := utils.GenerateToken(emp.Id, emp.Phone, emp.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token yaratishda xatolik yuz berdi"})
		return
	}

	c.JSON(http.StatusOK, models.LoginResp{
		Token:    token,
		Employee: emp,
	})
}

// GetProfile joriy kirgan xodim ma'lumotlarini (profilini) qaytaradi
func (h *Handler) GetProfile(c *gin.Context) {
	empIDVal, exists := c.Get("employee_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "avtorizatsiya qilinmagan"})
		return
	}

	empID, _ := empIDVal.(int64)
	emp, err := h.storage.GetEmployeeByID(empID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "xodim topilmadi"})
		return
	}

	c.JSON(http.StatusOK, emp)
}


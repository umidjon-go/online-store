package handler

import (
	"net/http"
	"online-store/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

// CreateSaleWithItems atomik kassa savdosini bajaradi: bitta Tranzaksiya ichida Sotuv + Chek tovarlari + Ombordan ayirish + To'lov
func (h *Handler) CreateSaleWithItems(c *gin.Context) {
	var body models.CreateSaleWithItemsReq
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(body.Items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "kamida bitta mahsulot kiritilishi shart (items bo'sh)"})
		return
	}

	resp, err := h.storage.CreateSaleWithItems(body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

func (h *Handler) CreateSale(c *gin.Context) {
	var body models.Sale
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.storage.CreateSale(body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

func (h *Handler) GetSaleByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid sale id"})
		return
	}

	resp, err := h.storage.GetSaleByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) GetAllSales(c *gin.Context) {
	resp, err := h.storage.GetAllSales()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if resp == nil {
		resp = []models.Sale{}
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) UpdateSale(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid sale id"})
		return
	}

	var body models.Sale
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	body.Id = id

	resp, err := h.storage.UpdateSale(body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) DeleteSale(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid sale id"})
		return
	}

	if err := h.storage.DeleteSale(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "sale deleted successfully"})
}

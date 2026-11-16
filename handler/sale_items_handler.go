package handler

import (
	"net/http"
	"online-store/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (h *Handler) CreateSaleItem(c *gin.Context) {
	var body models.SaleItem
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.storage.CreateSaleItem(body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

func (h *Handler) GetSaleItemByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid sale item id"})
		return
	}

	resp, err := h.storage.GetSaleItemByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) GetAllSaleItems(c *gin.Context) {
	saleIdStr := c.Query("sale_id")
	if saleIdStr != "" {
		saleId, err := strconv.ParseInt(saleIdStr, 10, 64)
		if err == nil {
			resp, err := h.storage.GetSaleItemsBySaleID(saleId)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if resp == nil {
				resp = []models.SaleItem{}
			}
			c.JSON(http.StatusOK, resp)
			return
		}
	}

	resp, err := h.storage.GetAllSaleItems()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if resp == nil {
		resp = []models.SaleItem{}
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) UpdateSaleItem(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid sale item id"})
		return
	}

	var body models.SaleItem
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	body.Id = id

	resp, err := h.storage.UpdateSaleItem(body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) DeleteSaleItem(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid sale item id"})
		return
	}

	if err := h.storage.DeleteSaleItem(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "sale item deleted successfully"})
}

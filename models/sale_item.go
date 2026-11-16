package models

import "time"

type SaleItem struct {
	Id        int64      `json:"id"`
	SaleId    int64      `json:"sale_id"`
	ProductId int64      `json:"product_id"`
	Quantity  int64      `json:"quantity"`
	UnitPrice int64      `json:"unit_price"`
	Subtotal  int64      `json:"subtotal"`
	CreatedAt *time.Time `json:"crated_at"`
}

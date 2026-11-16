package models

import "time"

type Sale struct {
	Id          int64      `json:"id"`
	CustomerId  int64      `json:"customer_id"`
	EmployeeId  int64      `json:"employee_id"`
	TOtalAmount int64      `json:"total_amount"`
	Discount    int64      `json:"discount"`
	Status      string     `json:"status"`
	CreatedAt   *time.Time `json:"created_at"`
	UpdatedAt   *time.Time `json:"updated_at"`
}

// Atomik savdo (kassa) uchun so'rov strukturasi (Bitta Tranzaksiyada: Sotuv + Tovarlar + To'lov + Ombordan ayirish)
type CreateSaleWithItemsReq struct {
	CustomerId  int64               `json:"customer_id"`
	EmployeeId  int64               `json:"employee_id"`
	TotalAmount int64               `json:"total_amount"`
	Discount    int64               `json:"discount"`
	Status      string              `json:"status"`
	Items       []CreateSaleItemReq `json:"items"`
	PaymentType string              `json:"payment_type,omitempty"`
}

type CreateSaleItemReq struct {
	ProductId int64 `json:"product_id"`
	Quantity  int64 `json:"quantity"`
	UnitPrice int64 `json:"unit_price"`
}

type SaleWithItemsResp struct {
	Sale    *Sale      `json:"sale"`
	Items   []SaleItem `json:"items"`
	Payment *Payment   `json:"payment,omitempty"`
}

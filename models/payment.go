package models

import "time"

type Payment struct {
	Id          int64      `json:"id"`
	SaleId      int64      `json:"sale_id"`
	Amount      int64      `json:"amount"`
	PaymentType string     `json:"payment_type"`
	Status      string     `json:"status"`
	PaidAt      *time.Time `json:"paid_at"`
}

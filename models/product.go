package models

import "time"

type Product struct {
	Id         int64      `json:"id"`
	Name       string     `json:"name"`
	CategoryId int64      `json:"category_id"`
	Price      int64      `json:"price"`
	Status     string     `json:"status"`
	Quantity   int64      `json:"quantity"`
	CreatedAt  *time.Time `json:"created_at"`
	UpdatedAt  *time.Time `json:"updated_at"`
}

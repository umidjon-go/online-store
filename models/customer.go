package models

import "time"

type Customer struct {
	Id        int64      `json:"id"`
	FullName  string     `json:"full_name"`
	Phone     string     `json:"phone"`
	Email     string     `json:"email"`
	Status    string     `json:"status"`
	CreatedBy *int64     `json:"created_by,omitempty"`
	CreatedAt *time.Time `json:"created_at"`
	UpdatedAt *time.Time `json:"updated_at"`
}

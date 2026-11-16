package models

import "time"

type Employee struct {
	Id        int64      `json:"id"`
	FirstName string     `json:"first_name"`
	LastName  string     `json:"last_name"`
	Phone     string     `json:"phone"`
	Role      string     `json:"role"`
	Status    string     `json:"status"`
	Salary    int64      `json:"salary"`
	CreatedAt *time.Time `json:"created_at"`
	UpdatedAt *time.Time `json:"updated_at"`
}

package models

import "time"

type Employee struct {
	Id            int64      `json:"id"`
	FirstName     string     `json:"first_name"`
	LastName      string     `json:"last_name"`
	Phone         string     `json:"phone"`
	Role          string     `json:"role"`   // "ADMIN", "MANAGER", "CASHIER"
	Status        string     `json:"status"` // "ACTIVE", "INACTIVE"
	Salary        int64      `json:"salary"`
	PasswordHash  string     `json:"-"`
	Password      string     `json:"password,omitempty"`
	PlainPassword string     `json:"plain_password,omitempty"`
	CreatedAt     *time.Time `json:"created_at"`
	UpdatedAt     *time.Time `json:"updated_at"`
}

type LoginReq struct {
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResp struct {
	Token    string    `json:"token"`
	Employee *Employee `json:"employee"`
}

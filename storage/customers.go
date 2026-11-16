package storage

import (
	"database/sql"
	"fmt"
	"online-store/models"
)

func (s *Storage) CreateCustomer(customer models.Customer) (*models.Customer, error) {
	if customer.Status == "" {
		customer.Status = "ACTIVE"
	}
	query := `
		INSERT INTO customers (full_name, phone, email, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING id, full_name, phone, email, status, created_at, updated_at
	`
	var resp models.Customer
	err := s.DB.QueryRow(query, customer.FullName, customer.Phone, customer.Email, customer.Status).Scan(
		&resp.Id,
		&resp.FullName,
		&resp.Phone,
		&resp.Email,
		&resp.Status,
		&resp.CreatedAt,
		&resp.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create customer: %w", err)
	}
	return &resp, nil
}

func (s *Storage) GetCustomerByID(id int64) (*models.Customer, error) {
	query := `
		SELECT id, full_name, phone, email, status, created_at, updated_at
		FROM customers
		WHERE id = $1
	`
	var resp models.Customer
	err := s.DB.QueryRow(query, id).Scan(
		&resp.Id,
		&resp.FullName,
		&resp.Phone,
		&resp.Email,
		&resp.Status,
		&resp.CreatedAt,
		&resp.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("customer not found")
		}
		return nil, fmt.Errorf("failed to get customer: %w", err)
	}
	return &resp, nil
}

func (s *Storage) GetAllCustomers() ([]models.Customer, error) {
	query := `
		SELECT id, full_name, phone, email, status, created_at, updated_at
		FROM customers
		ORDER BY id
	`
	rows, err := s.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to get customers: %w", err)
	}
	defer rows.Close()

	var customers []models.Customer
	for rows.Next() {
		var c models.Customer
		if err := rows.Scan(&c.Id, &c.FullName, &c.Phone, &c.Email, &c.Status, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan customer: %w", err)
		}
		customers = append(customers, c)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return customers, nil
}

func (s *Storage) UpdateCustomer(customer models.Customer) (*models.Customer, error) {
	if customer.Status == "" {
		customer.Status = "ACTIVE"
	}
	query := `
		UPDATE customers
		SET full_name = $1, phone = $2, email = $3, status = $4, updated_at = NOW()
		WHERE id = $5
		RETURNING id, full_name, phone, email, status, created_at, updated_at
	`
	var resp models.Customer
	err := s.DB.QueryRow(query, customer.FullName, customer.Phone, customer.Email, customer.Status, customer.Id).Scan(
		&resp.Id,
		&resp.FullName,
		&resp.Phone,
		&resp.Email,
		&resp.Status,
		&resp.CreatedAt,
		&resp.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("customer not found")
		}
		return nil, fmt.Errorf("failed to update customer: %w", err)
	}
	return &resp, nil
}

func (s *Storage) DeleteCustomer(id int64) error {
	query := `DELETE FROM customers WHERE id = $1`
	res, err := s.DB.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete customer: %w", err)
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return fmt.Errorf("customer not found")
	}
	return nil
}

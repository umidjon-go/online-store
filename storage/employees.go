package storage

import (
	"database/sql"
	"fmt"
	"online-store/models"
)

func (s *Storage) CreateEmployee(employee models.Employee) (*models.Employee, error) {
	if employee.Status == "" {
		employee.Status = "ACTIVE"
	}
	query := `
		INSERT INTO employees (first_name, last_name, phone, role, status, salary, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
		RETURNING id, first_name, last_name, phone, role, status, salary, created_at, updated_at
	`
	var resp models.Employee
	err := s.DB.QueryRow(
		query,
		employee.FirstName,
		employee.LastName,
		employee.Phone,
		employee.Role,
		employee.Status,
		employee.Salary,
	).Scan(
		&resp.Id,
		&resp.FirstName,
		&resp.LastName,
		&resp.Phone,
		&resp.Role,
		&resp.Status,
		&resp.Salary,
		&resp.CreatedAt,
		&resp.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create employee: %w", err)
	}
	return &resp, nil
}

func (s *Storage) GetEmployeeByID(id int64) (*models.Employee, error) {
	query := `
		SELECT id, first_name, last_name, phone, role, status, salary, created_at, updated_at
		FROM employees
		WHERE id = $1
	`
	var resp models.Employee
	err := s.DB.QueryRow(query, id).Scan(
		&resp.Id,
		&resp.FirstName,
		&resp.LastName,
		&resp.Phone,
		&resp.Role,
		&resp.Status,
		&resp.Salary,
		&resp.CreatedAt,
		&resp.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("employee not found")
		}
		return nil, fmt.Errorf("failed to get employee: %w", err)
	}
	return &resp, nil
}

func (s *Storage) GetAllEmployees() ([]models.Employee, error) {
	query := `
		SELECT id, first_name, last_name, phone, role, status, salary, created_at, updated_at
		FROM employees
		ORDER BY id
	`
	rows, err := s.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to get employees: %w", err)
	}
	defer rows.Close()

	var employees []models.Employee
	for rows.Next() {
		var e models.Employee
		if err := rows.Scan(
			&e.Id,
			&e.FirstName,
			&e.LastName,
			&e.Phone,
			&e.Role,
			&e.Status,
			&e.Salary,
			&e.CreatedAt,
			&e.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan employee: %w", err)
		}
		employees = append(employees, e)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return employees, nil
}

func (s *Storage) UpdateEmployee(employee models.Employee) (*models.Employee, error) {
	if employee.Status == "" {
		employee.Status = "ACTIVE"
	}
	query := `
		UPDATE employees
		SET first_name = $1, last_name = $2, phone = $3, role = $4, status = $5, salary = $6, updated_at = NOW()
		WHERE id = $7
		RETURNING id, first_name, last_name, phone, role, status, salary, created_at, updated_at
	`
	var resp models.Employee
	err := s.DB.QueryRow(
		query,
		employee.FirstName,
		employee.LastName,
		employee.Phone,
		employee.Role,
		employee.Status,
		employee.Salary,
		employee.Id,
	).Scan(
		&resp.Id,
		&resp.FirstName,
		&resp.LastName,
		&resp.Phone,
		&resp.Role,
		&resp.Status,
		&resp.Salary,
		&resp.CreatedAt,
		&resp.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("employee not found")
		}
		return nil, fmt.Errorf("failed to update employee: %w", err)
	}
	return &resp, nil
}

func (s *Storage) DeleteEmployee(id int64) error {
	query := `DELETE FROM employees WHERE id = $1`
	res, err := s.DB.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete employee: %w", err)
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return fmt.Errorf("employee not found")
	}
	return nil
}

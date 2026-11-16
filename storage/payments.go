package storage

import (
	"database/sql"
	"fmt"
	"online-store/models"
)

func (s *Storage) CreatePayment(payment models.Payment) (*models.Payment, error) {
	if payment.Status == "" {
		payment.Status = "PENDING"
	}
	query := `
		INSERT INTO payments (sale_id, amount, payment_type, status, paid_at)
		VALUES ($1, $2, $3, $4, NOW())
		RETURNING id, COALESCE(sale_id, 0), amount, COALESCE(payment_type, ''), status, paid_at
	`
	var resp models.Payment
	err := s.DB.QueryRow(
		query,
		payment.SaleId,
		payment.Amount,
		payment.PaymentType,
		payment.Status,
	).Scan(
		&resp.Id,
		&resp.SaleId,
		&resp.Amount,
		&resp.PaymentType,
		&resp.Status,
		&resp.PaidAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment: %w", err)
	}
	return &resp, nil
}

func (s *Storage) GetPaymentByID(id int64) (*models.Payment, error) {
	query := `
		SELECT id, COALESCE(sale_id, 0), amount, COALESCE(payment_type, ''), status, paid_at
		FROM payments
		WHERE id = $1
	`
	var resp models.Payment
	err := s.DB.QueryRow(query, id).Scan(
		&resp.Id,
		&resp.SaleId,
		&resp.Amount,
		&resp.PaymentType,
		&resp.Status,
		&resp.PaidAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("payment not found")
		}
		return nil, fmt.Errorf("failed to get payment: %w", err)
	}
	return &resp, nil
}

func (s *Storage) GetAllPayments() ([]models.Payment, error) {
	query := `
		SELECT id, COALESCE(sale_id, 0), amount, COALESCE(payment_type, ''), status, paid_at
		FROM payments
		ORDER BY id
	`
	rows, err := s.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to get payments: %w", err)
	}
	defer rows.Close()

	var payments []models.Payment
	for rows.Next() {
		var p models.Payment
		if err := rows.Scan(
			&p.Id,
			&p.SaleId,
			&p.Amount,
			&p.PaymentType,
			&p.Status,
			&p.PaidAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan payment: %w", err)
		}
		payments = append(payments, p)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return payments, nil
}

func (s *Storage) UpdatePayment(payment models.Payment) (*models.Payment, error) {
	if payment.Status == "" {
		payment.Status = "PENDING"
	}
	query := `
		UPDATE payments
		SET sale_id = $1, amount = $2, payment_type = $3, status = $4
		WHERE id = $5
		RETURNING id, COALESCE(sale_id, 0), amount, COALESCE(payment_type, ''), status, paid_at
	`
	var resp models.Payment
	err := s.DB.QueryRow(
		query,
		payment.SaleId,
		payment.Amount,
		payment.PaymentType,
		payment.Status,
		payment.Id,
	).Scan(
		&resp.Id,
		&resp.SaleId,
		&resp.Amount,
		&resp.PaymentType,
		&resp.Status,
		&resp.PaidAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("payment not found")
		}
		return nil, fmt.Errorf("failed to update payment: %w", err)
	}
	return &resp, nil
}

func (s *Storage) DeletePayment(id int64) error {
	query := `DELETE FROM payments WHERE id = $1`
	res, err := s.DB.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete payment: %w", err)
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return fmt.Errorf("payment not found")
	}
	return nil
}

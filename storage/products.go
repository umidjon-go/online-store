package storage

import (
	"database/sql"
	"fmt"
	"online-store/models"
)

func (s *Storage) CreateProduct(product models.Product) (*models.Product, error) {
	if product.Status == "" {
		product.Status = "ACTIVE"
	}
	query := `
		INSERT INTO products (name, category_id, price, status, quantity, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, name, COALESCE(category_id, 0), price, status, quantity, created_at, updated_at
	`
	var resp models.Product
	err := s.DB.QueryRow(query, product.Name, product.CategoryId, product.Price, product.Status, product.Quantity).Scan(
		&resp.Id,
		&resp.Name,
		&resp.CategoryId,
		&resp.Price,
		&resp.Status,
		&resp.Quantity,
		&resp.CreatedAt,
		&resp.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create product: %w", err)
	}
	return &resp, nil
}

func (s *Storage) GetProductByID(id int64) (*models.Product, error) {
	query := `
		SELECT id, name, COALESCE(category_id, 0), price, status, quantity, created_at, updated_at
		FROM products
		WHERE id = $1
	`
	var resp models.Product
	err := s.DB.QueryRow(query, id).Scan(
		&resp.Id,
		&resp.Name,
		&resp.CategoryId,
		&resp.Price,
		&resp.Status,
		&resp.Quantity,
		&resp.CreatedAt,
		&resp.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("product not found")
		}
		return nil, fmt.Errorf("failed to get product: %w", err)
	}
	return &resp, nil
}

func (s *Storage) GetAllProducts() ([]models.Product, error) {
	query := `
		SELECT id, name, COALESCE(category_id, 0), price, status, quantity, created_at, updated_at
		FROM products
		ORDER BY id
	`
	rows, err := s.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to get products: %w", err)
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		if err := rows.Scan(&p.Id, &p.Name, &p.CategoryId, &p.Price, &p.Status, &p.Quantity, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan product: %w", err)
		}
		products = append(products, p)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return products, nil
}

func (s *Storage) UpdateProduct(product models.Product) (*models.Product, error) {
	if product.Status == "" {
		product.Status = "ACTIVE"
	}
	query := `
		UPDATE products
		SET name = $1, category_id = $2, price = $3, status = $4, quantity = $5, updated_at = NOW()
		WHERE id = $6
		RETURNING id, name, COALESCE(category_id, 0), price, status, quantity, created_at, updated_at
	`
	var resp models.Product
	err := s.DB.QueryRow(query, product.Name, product.CategoryId, product.Price, product.Status, product.Quantity, product.Id).Scan(
		&resp.Id,
		&resp.Name,
		&resp.CategoryId,
		&resp.Price,
		&resp.Status,
		&resp.Quantity,
		&resp.CreatedAt,
		&resp.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("product not found")
		}
		return nil, fmt.Errorf("failed to update product: %w", err)
	}
	return &resp, nil
}

func (s *Storage) DeleteProduct(id int64) error {
	query := `DELETE FROM products WHERE id = $1`
	res, err := s.DB.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete product: %w", err)
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return fmt.Errorf("product not found")
	}
	return nil
}

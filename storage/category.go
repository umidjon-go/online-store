package storage

import (
	"database/sql"
	"fmt"
	"online-store/models"
)

func (s *Storage) CreateCategory(category models.Category) (*models.Category, error) {
	query := `
		INSERT INTO category (name, description, created_at, updated_at)
		VALUES ($1, $2, NOW(), NOW())
		RETURNING id, name, COALESCE(description, ''), created_at, updated_at
	`
	var resp models.Category
	err := s.DB.QueryRow(query, category.Name, category.Description).Scan(
		&resp.Id,
		&resp.Name,
		&resp.Description,
		&resp.CreatedAt,
		&resp.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create category: %w", err)
	}
	return &resp, nil
}

func (s *Storage) GetCategoryByID(id int) (*models.Category, error) {
	query := `
		SELECT id, name, COALESCE(description, ''), created_at, updated_at
		FROM category
		WHERE id = $1
	`
	var resp models.Category
	err := s.DB.QueryRow(query, id).Scan(
		&resp.Id,
		&resp.Name,
		&resp.Description,
		&resp.CreatedAt,
		&resp.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("category not found")
		}
		return nil, fmt.Errorf("failed to get category: %w", err)
	}
	return &resp, nil
}

func (s *Storage) GetAllCategories() ([]models.Category, error) {
	query := `
		SELECT id, name, COALESCE(description, ''), created_at, updated_at
		FROM category
		ORDER BY id
	`
	rows, err := s.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to get categories: %w", err)
	}
	defer rows.Close()

	var categories []models.Category
	for rows.Next() {
		var c models.Category
		if err := rows.Scan(&c.Id, &c.Name, &c.Description, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan category: %w", err)
		}
		categories = append(categories, c)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return categories, nil
}

func (s *Storage) UpdateCategory(category models.Category) (*models.Category, error) {
	query := `
		UPDATE category
		SET name = $1, description = $2, updated_at = NOW()
		WHERE id = $3
		RETURNING id, name, COALESCE(description, ''), created_at, updated_at
	`
	var resp models.Category
	err := s.DB.QueryRow(query, category.Name, category.Description, category.Id).Scan(
		&resp.Id,
		&resp.Name,
		&resp.Description,
		&resp.CreatedAt,
		&resp.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("category not found")
		}
		return nil, fmt.Errorf("failed to update category: %w", err)
	}
	return &resp, nil
}

func (s *Storage) DeleteCategory(id int) error {
	query := `DELETE FROM category WHERE id = $1`
	res, err := s.DB.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return fmt.Errorf("category not found")
	}
	return nil
}

package storage

import (
	"database/sql"
	"fmt"
	"online-store/models"
)

// CreateSaleItem mahsulot qoldig'ini kamaytiradi va chek tovarini atomik tranzaksiya (Tx) ichida yaratadi
func (s *Storage) CreateSaleItem(item models.SaleItem) (*models.SaleItem, error) {
	if item.Subtotal == 0 && item.Quantity > 0 && item.UnitPrice > 0 {
		item.Subtotal = item.Quantity * item.UnitPrice
	}

	tx, err := s.DB.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	// 1. Mahsulot qoldig'ini qatorni bloklash (FOR UPDATE) orqali tekshirish
	var (
		productName  string
		currentStock int64
		currentPrice int64
	)
	err = tx.QueryRow(
		`SELECT name, quantity, price FROM products WHERE id = $1 FOR UPDATE`,
		item.ProductId,
	).Scan(&productName, &currentStock, &currentPrice)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("mahsulot topilmadi (ID: %d)", item.ProductId)
		}
		return nil, fmt.Errorf("failed to check product stock: %w", err)
	}

	if currentStock < item.Quantity {
		return nil, fmt.Errorf("'%s' mahsulotidan omborda yetarli emas (ID: %d): mavjud %d ta, so'ralgan %d ta",
			productName, item.ProductId, currentStock, item.Quantity)
	}

	// 2. Ombordagi mahsulot sonini kamaytirish
	_, err = tx.Exec(
		`UPDATE products SET quantity = quantity - $1, updated_at = NOW() WHERE id = $2`,
		item.Quantity,
		item.ProductId,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to decrement product stock: %w", err)
	}

	if item.UnitPrice <= 0 {
		item.UnitPrice = currentPrice
		item.Subtotal = item.UnitPrice * item.Quantity
	}

	// 3. Insert sale item
	query := `
		INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		RETURNING id, sale_id, COALESCE(product_id, 0), quantity, unit_price, subtotal, created_at
	`
	var resp models.SaleItem
	err = tx.QueryRow(
		query,
		item.SaleId,
		item.ProductId,
		item.Quantity,
		item.UnitPrice,
		item.Subtotal,
	).Scan(
		&resp.Id,
		&resp.SaleId,
		&resp.ProductId,
		&resp.Quantity,
		&resp.UnitPrice,
		&resp.Subtotal,
		&resp.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create sale item: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit sale item transaction: %w", err)
	}

	return &resp, nil
}

func (s *Storage) GetSaleItemByID(id int64) (*models.SaleItem, error) {
	query := `
		SELECT id, sale_id, COALESCE(product_id, 0), quantity, unit_price, subtotal, created_at
		FROM sale_items
		WHERE id = $1
	`
	var resp models.SaleItem
	err := s.DB.QueryRow(query, id).Scan(
		&resp.Id,
		&resp.SaleId,
		&resp.ProductId,
		&resp.Quantity,
		&resp.UnitPrice,
		&resp.Subtotal,
		&resp.CreatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("sale item not found")
		}
		return nil, fmt.Errorf("failed to get sale item: %w", err)
	}
	return &resp, nil
}

func (s *Storage) GetAllSaleItems() ([]models.SaleItem, error) {
	query := `
		SELECT id, sale_id, COALESCE(product_id, 0), quantity, unit_price, subtotal, created_at
		FROM sale_items
		ORDER BY id
	`
	rows, err := s.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to get sale items: %w", err)
	}
	defer rows.Close()

	var items []models.SaleItem
	for rows.Next() {
		var it models.SaleItem
		if err := rows.Scan(
			&it.Id,
			&it.SaleId,
			&it.ProductId,
			&it.Quantity,
			&it.UnitPrice,
			&it.Subtotal,
			&it.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan sale item: %w", err)
		}
		items = append(items, it)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return items, nil
}

func (s *Storage) GetSaleItemsBySaleID(saleId int64) ([]models.SaleItem, error) {
	query := `
		SELECT id, sale_id, COALESCE(product_id, 0), quantity, unit_price, subtotal, created_at
		FROM sale_items
		WHERE sale_id = $1
		ORDER BY id
	`
	rows, err := s.DB.Query(query, saleId)
	if err != nil {
		return nil, fmt.Errorf("failed to get sale items by sale id: %w", err)
	}
	defer rows.Close()

	var items []models.SaleItem
	for rows.Next() {
		var it models.SaleItem
		if err := rows.Scan(
			&it.Id,
			&it.SaleId,
			&it.ProductId,
			&it.Quantity,
			&it.UnitPrice,
			&it.Subtotal,
			&it.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan sale item: %w", err)
		}
		items = append(items, it)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return items, nil
}

// UpdateSaleItem mahsulot qoldig'idagi farqni to'g'rilaydi va tranzaksiya ichida chek tovarini yangilaydi
func (s *Storage) UpdateSaleItem(item models.SaleItem) (*models.SaleItem, error) {
	if item.Subtotal == 0 && item.Quantity > 0 && item.UnitPrice > 0 {
		item.Subtotal = item.Quantity * item.UnitPrice
	}

	tx, err := s.DB.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	// 1. Hozirgi chek tovarini olib kelish
	var oldProductId, oldQuantity int64
	err = tx.QueryRow(
		`SELECT product_id, quantity FROM sale_items WHERE id = $1 FOR UPDATE`,
		item.Id,
	).Scan(&oldProductId, &oldQuantity)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("sale item not found")
		}
		return nil, fmt.Errorf("failed to find existing sale item: %w", err)
	}

	// 2. Ombordagi qoldiqni to'g'rilash
	if oldProductId == item.ProductId {
		diff := item.Quantity - oldQuantity
		if diff > 0 {
			// Ko'proq mahsulot kerak (ombordan ayiramiz)
			var currentStock int64
			err = tx.QueryRow(`SELECT quantity FROM products WHERE id = $1 FOR UPDATE`, item.ProductId).Scan(&currentStock)
			if err != nil {
				return nil, fmt.Errorf("failed to check product stock: %w", err)
			}
			if currentStock < diff {
				return nil, fmt.Errorf("yetarli qoldiq mavjud emas: talab %d ta, mavjud %d ta", diff, currentStock)
			}
			_, err = tx.Exec(`UPDATE products SET quantity = quantity - $1, updated_at = NOW() WHERE id = $2`, diff, item.ProductId)
			if err != nil {
				return nil, fmt.Errorf("failed to decrement product stock: %w", err)
			}
		} else if diff < 0 {
			// Ortiqcha mahsulotni omborga qaytaramiz
			_, err = tx.Exec(`UPDATE products SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2`, -diff, item.ProductId)
			if err != nil {
				return nil, fmt.Errorf("failed to increment product stock: %w", err)
			}
		}
	} else {
		// Mahsulot o'zgardi: eski mahsulotni omborga qaytarib, yangi mahsulotdan ayiramiz
		_, err = tx.Exec(`UPDATE products SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2`, oldQuantity, oldProductId)
		if err != nil {
			return nil, fmt.Errorf("failed to restore old product stock: %w", err)
		}

		var currentStock int64
		err = tx.QueryRow(`SELECT quantity FROM products WHERE id = $1 FOR UPDATE`, item.ProductId).Scan(&currentStock)
		if err != nil {
			return nil, fmt.Errorf("failed to check new product stock: %w", err)
		}
		if currentStock < item.Quantity {
			return nil, fmt.Errorf("yangi mahsulotdan yetarli qoldiq mavjud emas: talab %d ta, mavjud %d ta", item.Quantity, currentStock)
		}
		_, err = tx.Exec(`UPDATE products SET quantity = quantity - $1, updated_at = NOW() WHERE id = $2`, item.Quantity, item.ProductId)
		if err != nil {
			return nil, fmt.Errorf("failed to decrement new product stock: %w", err)
		}
	}

	// 3. Chek tovarini yangilash
	query := `
		UPDATE sale_items
		SET sale_id = $1, product_id = $2, quantity = $3, unit_price = $4, subtotal = $5
		WHERE id = $6
		RETURNING id, sale_id, COALESCE(product_id, 0), quantity, unit_price, subtotal, created_at
	`
	var resp models.SaleItem
	err = tx.QueryRow(
		query,
		item.SaleId,
		item.ProductId,
		item.Quantity,
		item.UnitPrice,
		item.Subtotal,
		item.Id,
	).Scan(
		&resp.Id,
		&resp.SaleId,
		&resp.ProductId,
		&resp.Quantity,
		&resp.UnitPrice,
		&resp.Subtotal,
		&resp.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update sale item: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit update sale item transaction: %w", err)
	}

	return &resp, nil
}

// DeleteSaleItem mahsulot sonini omborga qaytaradi va chek tovarini tranzaksiya ichida o'chiradi
func (s *Storage) DeleteSaleItem(id int64) error {
	tx, err := s.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	// 1. Mahsulot ID si va sonini aniqlash
	var productId, quantity int64
	err = tx.QueryRow(`SELECT product_id, quantity FROM sale_items WHERE id = $1 FOR UPDATE`, id).Scan(&productId, &quantity)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("sale item not found")
		}
		return fmt.Errorf("failed to find sale item: %w", err)
	}

	// 2. Mahsulot sonini omborga qaytarish
	_, err = tx.Exec(`UPDATE products SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2`, quantity, productId)
	if err != nil {
		return fmt.Errorf("failed to restore product stock: %w", err)
	}

	// 3. Chek tovarini o'chirish
	res, err := tx.Exec(`DELETE FROM sale_items WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete sale item: %w", err)
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return fmt.Errorf("sale item not found")
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit delete sale item transaction: %w", err)
	}
	return nil
}

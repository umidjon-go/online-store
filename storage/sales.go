package storage

import (
	"database/sql"
	"fmt"
	"online-store/models"
)

// CreateSale bitta sotuv (chek) yozuvini yaratadi
func (s *Storage) CreateSale(sale models.Sale) (*models.Sale, error) {
	if sale.Status == "" {
		sale.Status = "PENDING"
	}
	var custID *int64
	if sale.CustomerId > 0 {
		var exists bool
		_ = s.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM customers WHERE id = $1)`, sale.CustomerId).Scan(&exists)
		if exists {
			custID = &sale.CustomerId
		}
	}
	var empID *int64
	if sale.EmployeeId > 0 {
		var exists bool
		_ = s.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM employees WHERE id = $1)`, sale.EmployeeId).Scan(&exists)
		if exists {
			empID = &sale.EmployeeId
		}
	}
	query := `
		INSERT INTO sales (customer_id, employee_id, total_amount, discount, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, COALESCE(customer_id, 0), COALESCE(employee_id, 0), total_amount, discount, status, created_at, updated_at
	`
	var resp models.Sale
	err := s.DB.QueryRow(
		query,
		custID,
		empID,
		sale.TOtalAmount,
		sale.Discount,
		sale.Status,
	).Scan(
		&resp.Id,
		&resp.CustomerId,
		&resp.EmployeeId,
		&resp.TOtalAmount,
		&resp.Discount,
		&resp.Status,
		&resp.CreatedAt,
		&resp.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create sale: %w", err)
	}
	return &resp, nil
}

// CreateSaleWithItems bitta atomik Tranzaksiya (Tx) ichida Sotuv, uning tovarlari, ombor qoldig'ini ayirish va To'lovni yaratadi
func (s *Storage) CreateSaleWithItems(req models.CreateSaleWithItemsReq) (*models.SaleWithItemsResp, error) {
	if req.Status == "" {
		req.Status = "COMPLETED"
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

	// 1. Yangi sotuv (chek) yaratish - mijoz va xodim mavjudligini xavfsiz tekshiramiz
	var custID *int64
	if req.CustomerId > 0 {
		var exists bool
		_ = tx.QueryRow(`SELECT EXISTS(SELECT 1 FROM customers WHERE id = $1)`, req.CustomerId).Scan(&exists)
		if exists {
			custID = &req.CustomerId
		}
	}

	var empID *int64
	if req.EmployeeId > 0 {
		var exists bool
		_ = tx.QueryRow(`SELECT EXISTS(SELECT 1 FROM employees WHERE id = $1)`, req.EmployeeId).Scan(&exists)
		if exists {
			empID = &req.EmployeeId
		}
	}

	querySale := `
		INSERT INTO sales (customer_id, employee_id, total_amount, discount, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, COALESCE(customer_id, 0), COALESCE(employee_id, 0), total_amount, discount, status, created_at, updated_at
	`
	var sale models.Sale
	err = tx.QueryRow(
		querySale,
		custID,
		empID,
		req.TotalAmount,
		req.Discount,
		req.Status,
	).Scan(
		&sale.Id,
		&sale.CustomerId,
		&sale.EmployeeId,
		&sale.TOtalAmount,
		&sale.Discount,
		&sale.Status,
		&sale.CreatedAt,
		&sale.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create sale in transaction: %w", err)
	}

	// 2. Har bir tovar: Qoldiqni tekshirish -> Ombordan ayirish -> Chekka qo'shish
	var createdItems []models.SaleItem
	for _, item := range req.Items {
		var (
			productName  string
			currentStock int64
			currentPrice int64
		)

		// Poyga holati (race condition) bo'lmasligi uchun tovar qatorini FOR UPDATE bilan bloklaymiz
		err = tx.QueryRow(
			`SELECT name, quantity, price FROM products WHERE id = $1 FOR UPDATE`,
			item.ProductId,
		).Scan(&productName, &currentStock, &currentPrice)
		if err != nil {
			if err == sql.ErrNoRows {
				return nil, fmt.Errorf("mahsulot topilmadi (ID: %d)", item.ProductId)
			}
			return nil, fmt.Errorf("failed to check product stock (ID: %d): %w", item.ProductId, err)
		}

		if currentStock < item.Quantity {
			return nil, fmt.Errorf("'%s' mahsulotidan omborda yetarli emas (ID: %d): mavjud %d ta, so'ralgan %d ta",
				productName, item.ProductId, currentStock, item.Quantity)
		}

		// Ombordagi tovar sonini kamaytiramiz
		_, err = tx.Exec(
			`UPDATE products SET quantity = quantity - $1, updated_at = NOW() WHERE id = $2`,
			item.Quantity,
			item.ProductId,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to decrement product stock (ID: %d): %w", item.ProductId, err)
		}

		unitPrice := item.UnitPrice
		if unitPrice <= 0 {
			unitPrice = currentPrice
		}
		subtotal := unitPrice * item.Quantity

		queryItem := `
			INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal, created_at)
			VALUES ($1, $2, $3, $4, $5, NOW())
			RETURNING id, sale_id, COALESCE(product_id, 0), quantity, unit_price, subtotal, created_at
		`
		var createdItem models.SaleItem
		err = tx.QueryRow(
			queryItem,
			sale.Id,
			item.ProductId,
			item.Quantity,
			unitPrice,
			subtotal,
		).Scan(
			&createdItem.Id,
			&createdItem.SaleId,
			&createdItem.ProductId,
			&createdItem.Quantity,
			&createdItem.UnitPrice,
			&createdItem.Subtotal,
			&createdItem.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to create sale item in transaction: %w", err)
		}
		createdItems = append(createdItems, createdItem)
	}

	// 3. Ixtiyoriy: To'lov yozuvini yaratish
	var createdPayment *models.Payment
	if req.PaymentType != "" {
		netAmount := req.TotalAmount - req.Discount
		if netAmount < 0 {
			netAmount = 0
		}
		queryPayment := `
			INSERT INTO payments (sale_id, amount, payment_type, status, paid_at)
			VALUES ($1, $2, $3, $4, NOW())
			RETURNING id, COALESCE(sale_id, 0), amount, COALESCE(payment_type, ''), status, paid_at
		`
		var p models.Payment
		err = tx.QueryRow(
			queryPayment,
			sale.Id,
			netAmount,
			req.PaymentType,
			"COMPLETED",
		).Scan(
			&p.Id,
			&p.SaleId,
			&p.Amount,
			&p.PaymentType,
			&p.Status,
			&p.PaidAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to create payment in transaction: %w", err)
		}
		createdPayment = &p
	}

	// 4. Tranzaksiyani tasdiqlaymiz (Commit)
	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return &models.SaleWithItemsResp{
		Sale:    &sale,
		Items:   createdItems,
		Payment: createdPayment,
	}, nil
}

func (s *Storage) GetSaleByID(id int64) (*models.Sale, error) {
	query := `
		SELECT id, COALESCE(customer_id, 0), COALESCE(employee_id, 0), total_amount, discount, status, created_at, updated_at
		FROM sales
		WHERE id = $1
	`
	var resp models.Sale
	err := s.DB.QueryRow(query, id).Scan(
		&resp.Id,
		&resp.CustomerId,
		&resp.EmployeeId,
		&resp.TOtalAmount,
		&resp.Discount,
		&resp.Status,
		&resp.CreatedAt,
		&resp.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("sale not found")
		}
		return nil, fmt.Errorf("failed to get sale: %w", err)
	}
	return &resp, nil
}

func (s *Storage) GetAllSales() ([]models.Sale, error) {
	query := `
		SELECT id, COALESCE(customer_id, 0), COALESCE(employee_id, 0), total_amount, discount, status, created_at, updated_at
		FROM sales
		ORDER BY id
	`
	rows, err := s.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to get sales: %w", err)
	}
	defer rows.Close()

	var sales []models.Sale
	for rows.Next() {
		var sl models.Sale
		if err := rows.Scan(
			&sl.Id,
			&sl.CustomerId,
			&sl.EmployeeId,
			&sl.TOtalAmount,
			&sl.Discount,
			&sl.Status,
			&sl.CreatedAt,
			&sl.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan sale: %w", err)
		}
		sales = append(sales, sl)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return sales, nil
}

func (s *Storage) UpdateSale(sale models.Sale) (*models.Sale, error) {
	if sale.Status == "" {
		sale.Status = "PENDING"
	}
	query := `
		UPDATE sales
		SET customer_id = $1, employee_id = $2, total_amount = $3, discount = $4, status = $5, updated_at = NOW()
		WHERE id = $6
		RETURNING id, COALESCE(customer_id, 0), COALESCE(employee_id, 0), total_amount, discount, status, created_at, updated_at
	`
	var resp models.Sale
	err := s.DB.QueryRow(
		query,
		sale.CustomerId,
		sale.EmployeeId,
		sale.TOtalAmount,
		sale.Discount,
		sale.Status,
		sale.Id,
	).Scan(
		&resp.Id,
		&resp.CustomerId,
		&resp.EmployeeId,
		&resp.TOtalAmount,
		&resp.Discount,
		&resp.Status,
		&resp.CreatedAt,
		&resp.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("sale not found")
		}
		return nil, fmt.Errorf("failed to update sale: %w", err)
	}
	return &resp, nil
}

// DeleteSale barcha sotilgan tovarlarni yana omborga qaytaradi, so'ngra chekni tranzaksiya ichida o'chiradi
func (s *Storage) DeleteSale(id int64) error {
	tx, err := s.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	// 1. Ushbu sotuvdagi barcha tovarlarni olib kelish
	rows, err := tx.Query(`SELECT product_id, quantity FROM sale_items WHERE sale_id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to fetch sale items: %w", err)
	}
	defer rows.Close()

	type itemRestore struct {
		productId int64
		quantity  int64
	}
	var itemsToRestore []itemRestore
	for rows.Next() {
		var it itemRestore
		if err := rows.Scan(&it.productId, &it.quantity); err != nil {
			return fmt.Errorf("failed to scan sale item: %w", err)
		}
		itemsToRestore = append(itemsToRestore, it)
	}

	if err := rows.Err(); err != nil {
		return fmt.Errorf("rows iteration error: %w", err)
	}

	// 2. Tovar sonlarini omborga (products jadvaliga) qaytarish
	for _, it := range itemsToRestore {
		_, err = tx.Exec(
			`UPDATE products SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2`,
			it.quantity,
			it.productId,
		)
		if err != nil {
			return fmt.Errorf("failed to restore product stock (ID: %d): %w", it.productId, err)
		}
	}

	// 3. Sotuvni o'chirish (sale_items va payments kaskadli o'chadi)
	query := `DELETE FROM sales WHERE id = $1`
	res, err := tx.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete sale: %w", err)
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return fmt.Errorf("sale not found")
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit delete sale transaction: %w", err)
	}
	return nil
}

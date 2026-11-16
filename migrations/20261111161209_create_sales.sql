-- +goose Up
CREATE TABLE IF NOT EXISTS sales(
    "id" BIGSERIAL PRIMARY KEY,
    "customer_id" BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    "employee_id" BIGINT REFERENCES employees(id) ON DELETE SET NULL,
    "total_amount" BIGINT NOT NULL DEFAULT 0,
    "discount" BIGINT NOT NULL DEFAULT 0,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS sales;


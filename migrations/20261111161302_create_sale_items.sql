-- +goose Up
CREATE TABLE IF NOT EXISTS sale_items(
    "id" BIGSERIAL PRIMARY KEY,
    "sale_id" BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    "product_id" BIGINT REFERENCES products(id) ON DELETE SET NULL,
    "quantity" BIGINT NOT NULL DEFAULT 1,
    "unit_price" BIGINT NOT NULL DEFAULT 0,
    "subtotal" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS sale_items;


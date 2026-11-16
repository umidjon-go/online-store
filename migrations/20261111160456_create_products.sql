-- +goose Up
CREATE TABLE IF NOT EXISTS products(
    "id" BIGSERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "category_id" INT REFERENCES category(id) ON DELETE SET NULL,
    "price" BIGINT NOT NULL DEFAULT 0,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "quantity" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS products;


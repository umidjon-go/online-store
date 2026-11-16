-- +goose Up
CREATE TABLE IF NOT EXISTS customers(
    "id" BIGSERIAL PRIMARY KEY,
    "full_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS customers;


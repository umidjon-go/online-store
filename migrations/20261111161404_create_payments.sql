-- +goose Up
CREATE TABLE IF NOT EXISTS payments(
    "id" BIGSERIAL PRIMARY KEY,
    "sale_id" BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    "amount" BIGINT NOT NULL DEFAULT 0,
    "payment_type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS payments;

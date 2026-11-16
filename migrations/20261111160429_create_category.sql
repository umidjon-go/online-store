-- +goose Up
CREATE TABLE IF NOT EXISTS category(
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS category;


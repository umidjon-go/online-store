-- +goose Up
-- Xodimlar jadvaliga ochiq parolni (plain_password) faqat adminga ko'rsatish uchun ustun qo'shish
ALTER TABLE employees ADD COLUMN IF NOT EXISTS plain_password VARCHAR(255) DEFAULT '';

UPDATE employees SET plain_password = 'admin123' WHERE role = 'ADMIN' AND (plain_password = '' OR plain_password IS NULL);
UPDATE employees SET plain_password = 'manager123' WHERE role = 'MANAGER' AND (plain_password = '' OR plain_password IS NULL);
UPDATE employees SET plain_password = 'kassir123' WHERE role = 'CASHIER' AND (plain_password = '' OR plain_password IS NULL);

-- +goose Down
ALTER TABLE employees DROP COLUMN IF EXISTS plain_password;


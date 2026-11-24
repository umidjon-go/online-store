-- +goose Up
-- 1. Xodimlar jadvaliga password_hash ustuni qo'shish
ALTER TABLE employees ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) DEFAULT '';

-- 2. Telefon raqami takrorlanmasligini (UNIQUE) ta'minlash
CREATE UNIQUE INDEX IF NOT EXISTS employees_phone_unique ON employees (phone);

-- 3. Mijozlar jadvaliga uni yaratgan xodim (kassir) ID sini bog'lash
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by BIGINT REFERENCES employees(id) ON DELETE SET NULL;

-- 4. Dastlabki sinov hisoblarini yaratish (Admin, Menejer, Kassir)
-- Admin: +998901234567 / admin123
INSERT INTO employees (first_name, last_name, phone, role, status, salary, password_hash, created_at, updated_at)
VALUES (
    'Bosh',
    'Admin',
    '+998901234567',
    'ADMIN',
    'ACTIVE',
    15000000,
    '$2a$10$VGfmWFKlHeKv6ovPzs4JD.ev.u2PcJFMHd9lfxeqnnyu1sKCkApGm',
    NOW(),
    NOW()
)
ON CONFLICT (phone) DO UPDATE 
SET password_hash = EXCLUDED.password_hash 
WHERE employees.password_hash = '' OR employees.password_hash IS NULL;

-- Menejer: +998974445566 / manager123
INSERT INTO employees (first_name, last_name, phone, role, status, salary, password_hash, created_at, updated_at)
VALUES (
    'Shahlo',
    'Azizova (Menejer)',
    '+998974445566',
    'MANAGER',
    'ACTIVE',
    8000000,
    '$2a$10$tTn33kM3wpKd0xkuXuVjcO4EhLgCmVQ0q9vnqgjkxHpKiGQvvEUdC',
    NOW(),
    NOW()
)
ON CONFLICT (phone) DO UPDATE 
SET password_hash = EXCLUDED.password_hash 
WHERE employees.password_hash = '' OR employees.password_hash IS NULL;

-- Kassir: +998912223344 / kassir123
INSERT INTO employees (first_name, last_name, phone, role, status, salary, password_hash, created_at, updated_at)
VALUES (
    'Nodira',
    'Sobirova (Kassir)',
    '+998912223344',
    'CASHIER',
    'ACTIVE',
    5500000,
    '$2a$10$32F/sWcE9fWIlNXZNRwqwOfu6C2UxoV0scUHBFZSE0iUh/ELdH1bC',
    NOW(),
    NOW()
)
ON CONFLICT (phone) DO UPDATE 
SET password_hash = EXCLUDED.password_hash 
WHERE employees.password_hash = '' OR employees.password_hash IS NULL;

-- +goose Down
ALTER TABLE customers DROP COLUMN IF EXISTS created_by;
DROP INDEX IF EXISTS employees_phone_unique;
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_phone_unique;
ALTER TABLE employees DROP COLUMN IF EXISTS password_hash;


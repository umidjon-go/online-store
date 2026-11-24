-- +goose Up
-- 1. To'lovlar (payments) jadvalini yaratish
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL DEFAULT 0,
    payment_type VARCHAR(50) NOT NULL DEFAULT 'CASH',
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    paid_at TIMESTAMP DEFAULT NOW()
);

-- 2. Barcha 4 ta rol uchun hisoblarni employees jadvalida to'liq ta'minlash (Admin, Menejer, Kassirlar va Mijoz)
-- Admin (+998901234567 / admin123)
INSERT INTO employees (first_name, last_name, phone, role, status, salary, password_hash, plain_password, created_at, updated_at)
VALUES (
    'Bosh',
    'Admin',
    '+998901234567',
    'ADMIN',
    'ACTIVE',
    15000000,
    '$2a$10$VGfmWFKlHeKv6ovPzs4JD.ev.u2PcJFMHd9lfxeqnnyu1sKCkApGm',
    'admin123',
    NOW(),
    NOW()
)
ON CONFLICT (phone) DO UPDATE 
SET password_hash = EXCLUDED.password_hash, plain_password = 'admin123', role = 'ADMIN', status = 'ACTIVE';

-- Menejer (+998974445566 / manager123)
INSERT INTO employees (first_name, last_name, phone, role, status, salary, password_hash, plain_password, created_at, updated_at)
VALUES (
    'Shahlo',
    'Azizova (Menejer)',
    '+998974445566',
    'MANAGER',
    'ACTIVE',
    8000000,
    '$2a$10$tTn33kM3wpKd0xkuXuVjcO4EhLgCmVQ0q9vnqgjkxHpKiGQvvEUdC',
    'manager123',
    NOW(),
    NOW()
)
ON CONFLICT (phone) DO UPDATE 
SET password_hash = EXCLUDED.password_hash, plain_password = 'manager123', role = 'MANAGER', status = 'ACTIVE';

-- Kassir Nodira (+998912223344 / kassir123)
INSERT INTO employees (first_name, last_name, phone, role, status, salary, password_hash, plain_password, created_at, updated_at)
VALUES (
    'Nodira',
    'Sobirova (Kassir)',
    '+998912223344',
    'CASHIER',
    'ACTIVE',
    5500000,
    '$2a$10$32F/sWcE9fWIlNXZNRwqwOfu6C2UxoV0scUHBFZSE0iUh/ELdH1bC',
    'kassir123',
    NOW(),
    NOW()
)
ON CONFLICT (phone) DO UPDATE 
SET password_hash = EXCLUDED.password_hash, plain_password = 'kassir123', role = 'CASHIER', status = 'ACTIVE';

-- Kassir Jasur (+998979177788 / kassir123)
INSERT INTO employees (first_name, last_name, phone, role, status, salary, password_hash, plain_password, created_at, updated_at)
VALUES (
    'Jasur',
    'Karimov (Kassir)',
    '+998979177788',
    'CASHIER',
    'ACTIVE',
    5000000,
    '$2a$10$32F/sWcE9fWIlNXZNRwqwOfu6C2UxoV0scUHBFZSE0iUh/ELdH1bC',
    'kassir123',
    NOW(),
    NOW()
)
ON CONFLICT (phone) DO UPDATE 
SET password_hash = EXCLUDED.password_hash, plain_password = 'kassir123', role = 'CASHIER', status = 'ACTIVE';

-- Mijoz (+998901234568 / mijoz123)
INSERT INTO employees (first_name, last_name, phone, role, status, salary, password_hash, plain_password, created_at, updated_at)
VALUES (
    'Alisher',
    'Qodirov (Mijoz)',
    '+998901234568',
    'CUSTOMER',
    'ACTIVE',
    0,
    '$2a$10$ETzyUGRoskQRr7B.slBQk.uLoNn.gT1rSwalgrGFWBXqxYLmNLpmS',
    'mijoz123',
    NOW(),
    NOW()
)
ON CONFLICT (phone) DO UPDATE 
SET password_hash = EXCLUDED.password_hash, plain_password = 'mijoz123', role = 'CUSTOMER', status = 'ACTIVE';

-- 3. Mijozlar jadvaliga mijozlarni to'ldirish (kassirlar ko'rishi va xarid qilish uchun)
INSERT INTO customers (id, full_name, phone, email, status, created_by, created_at, updated_at)
VALUES 
    (10, 'Alisher Qodirov (Doimiy Mijoz)', '+998901234568', 'alisher@tezbozor.uz', 'ACTIVE', 1, NOW(), NOW()),
    (11, 'Umumiy Xaridor (Chakana)', '+998900000000', 'umumiy@tezbozor.uz', 'ACTIVE', 1, NOW(), NOW()),
    (12, 'Dilnoza Karimova', '+998939876543', 'dilnoza@tezbozor.uz', 'ACTIVE', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE 
SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, status = 'ACTIVE';

-- +goose Down
DROP TABLE IF EXISTS payments;


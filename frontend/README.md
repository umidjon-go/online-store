# TezBozor - Do'kon va Savdo Boshqaruv Tizimi (Frontend)

Ushbu loyiha **"TezBozor"** do'kon va savdo boshqaruv tizimining zamonaviy, tezkor va to'liq frontend qismidir. U `c:\Users\user\Desktop\online-store` manzilidagi Go Gin REST API backend bilan 100% mos holatda ishlab chiqilgan.

---

## 🚀 Texnologiyalar Steki

- **React 19** & **TypeScript**
- **Vite 8** (juda tezkor yig'uvchi)
- **Tailwind CSS v4** (zamonaviy SaaS va POS dizayni)
- **Lucide React** (professional piktogrammalar)
- **Axios** (REST API mijoz)
- **React Router v7** (sahifalararo navigatsiya)

---

## 📁 Tizim Imkoniyatlari va Sahifalari

1. **📊 Boshqaruv Paneli (Dashboard):**
   - Jami daromad, savdolar soni, ombordagi tovarlar xili, kam qolgan tovarlar ogohlantirishlari
   - So'nggi savdo cheklari jadvali
   - Tezkor amallar (savdo boshlash, tovar qo'shish, mijoz va xodim kiritish)

2. **🛒 Kassa / POS (Tezkor Savdo Terminali):**
   - Mahsulotlarni nomi yoki kodi bo'yicha tezkor qidirish
   - Kategoriya bo'yicha saralash
   - Savatchaga qo'shish, miqdorini boshqarish (+/-), chegirma berish
   - Xaridor va kassirni tanlash (yoki joyida yangi mijoz qo'shish)
   - To'lov turini tanlash: **Naqd pul (CASH)**, **Bank kartasi (Uzcard/Humo - CARD)**, **Click**, **Payme**
   - Naqd pulda qaytimni (сдача) avtomatik hisoblash
   - Bir tugma bilan Go backendda:
     - `POST /sales/` (Sotuv yaratish)
     - `POST /sale-items/` (Har bir sotilgan tovarni biriktirish)
     - `POST /payments/` (To'lov yozuvini yaratish)
   - Bosib chiqarishga tayyor savdo kvitansiyasi (Receipt Print Modal)

3. **📦 Mahsulotlar (Products):**
   - Barcha tovarlar ro'yxati, narxi, qoldiq soni va faollik holati (`ACTIVE` / `INACTIVE`)
   - Qoldiq kam qolgan tovarlarni rangli indikator orqali ajratib ko'rsatish
   - Yangi mahsulot kiritish, tahrirlash va o'chirish (CRUD)

4. **🏷️ Kategoriyalar (Categories):**
   - Mahsulot bo'limlarini boshqarish (`/categories/`)
   - Har bir kategoriyaga tegishli tovarlar soni hisoblagichi

5. **🧾 Sotuvlar Tarixi (Sales & Receipts):**
   - Barcha rasmiylashtirilgan cheklar jurnali
   - Chek holatlari bo'yicha filtrlash: `COMPLETED` (To'langan), `PENDING` (Kutilmoqda), `CANCELLED` (Bekor)
   - Chek tafsilotlari (modal orqali ichidagi sotilgan barcha `sale-items` va to'lov usulini ko'rish)
   - Chekni qayta chop etish (Print) va holatini yangilash

6. **👥 Mijozlar (Customers):**
   - Doimiy mijozlar bazasi (F.I.SH, telefon, email, status)
   - Har bir mijozning amalga oshirgan xaridlari soni
   - Yangi mijoz kiritish, tahrirlash va o'chirish

7. **👔 Xodimlar (Employees):**
   - Do'kon kassirlari, menejerlari va administratorlari shtati
   - Rollar: `ADMIN`, `CASHIER`, `MANAGER`
   - Oylik maoshini so'mda nazorat qilish

8. **💳 To'lovlar (Payments):**
   - Kassa va elektron to'lovlar reyestri (`/payments/`)
   - To'lov usuli bo'yicha filtrlash (CASH, CARD, CLICK, PAYME)

9. **⚙️ Sozlamalar & API Integratsiyasi:**
   - Backend URL manzilini sozlash (standart: `http://localhost:8080`)
   - Backend aloqasini tekshirish (Test Connection)
   - **Avtonom Demo Rejim:** Agar backend yoki PostgreSQL serveri hozircha ulanmagan bo'lsa ham, barcha funksiyalarni to'liq sinovdan o'tkazish imkoniyati

---

## 🛠️ Loyihani Ishga Tushirish

### 1. Frontendni ishga tushirish:
```bash
cd c:\Users\user\Desktop\store_frontend
npm run dev
```
Brauzerda ochiladi: `http://localhost:3000`

### 2. Backendni ishga tushirish (agar kerak bo'lsa):
```bash
cd c:\Users\user\Desktop\online-store
go run main.go
```
Backend `http://localhost:8080` portida ishga tushadi va frontend avtomatik tarzda unga ulanadi!


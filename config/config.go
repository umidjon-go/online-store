package config

import (
	"os" // - Go ning operatsion tizim kutubxonasi.
	// Bu kutubxona bizga kompyuterning "tashqi dunyosi" - ya'ni fayllar, papkalar,
	// muhit o'zgaruvchilari (environment variables) bilan ishlash imkonini beradi.

	"github.com/joho/godotenv" // - Tashqi kutubxona bo'lib u loyiha papkasidagi .env nomli faylni topib.
	// uning ichidagi yozuvlarni Go dasturining xotirasiga (Environment Variables) yuklaydi.
)

// config - "Biz kimmiz , bazamiz qayerda, parol nima?" degan savollarga javob beradi.
// Ushbu faylning vazifasi - maxfiy malumotlarni (parol, port, baza nomi) kod ichiga yozmasdan tashqi .env fayldan olib kelish.
// Bu xavfsizlikni oshiradi, chunki maxfiy malumotlar kod ichiga yozilmaydi.

type Config struct {
	PostgresHost string // - Baza joylashgan manzil (masalan, localhost joki server IP
	PostgresPort string // - Baza eshitayotgan port(PostgreSQL standarti boyicha 5432)
	PostgresUser string // - Baza foykalanuvchisi (postgres)
	PostgresPass string // - Baza maxfiy paroli (102938)
	PostgresDb   string // - Malumotlar bazasi nomi(postgres)
}

func Load() *Config {
	godotenv.Load() // .env fayldagi malumotlarni yuklaydi.
	return &Config{
		PostgresHost: os.Getenv("POSTGRES_HOST"),
		PostgresPort: os.Getenv("POSTGRES_PORT"),
		PostgresUser: os.Getenv("POSTGRES_USER"),
		PostgresPass: os.Getenv("POSTGRES_PASS"),
		PostgresDb:   os.Getenv("POSTGRES_DB"),
	}
}

// MUHIM ESLATMA
// Agar bu bolmasa nima bulardi?
// Biz parollarni togridan-togri kod ichiga password="102938"deb yozishga majbur bular edik.(Bu xavfli).
// Ertaga kodni GitHub-ga yuklasak, butun dunyo bizning parolimizni korib qolardi.
// Loyihani boshqa kompyuterga yoki haqiqiy serverga otkazganda esa, kodni qaytadan tahrirlab otirmay, faqatgina
// .env fayldagi malumotlarni ozgartirish kifoya qilardi.

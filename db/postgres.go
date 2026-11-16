package db

import (
	"database/sql" // Go ning standart malumotlar bazasi bilan ishlash kutubxonasi. U SQL sorovlarini yuborish, natijalarni oqish
	// va Ulanishlar Hovuzi (connection Pool) bilan ishlash imkonini beradi.
	"fmt"
	"online-store/config"

	_ "github.com/lib/pq"
	// Eng qiziqarli joyi! Bu PostgreSQL uchun PostgreSQL Driveri.
	// Nega boshida tagchiziq _ (blank identifier) qo'yilgan?
	// Sababi - bu kutubxona o'zini to'liq ishga tushiradi,
	// Go tilida import qilingan, ammo ishlatilmagan paketlar (importend and not used) xatolik beradi.
	// Lekin _ qoyilsa, Go uni: "Men uning funksiyasini qolda chqirmayman, lekin ni yukla va ichidagi init() funksiyasini yurgiz" deb tushunadi.
	// Bu degani: "Men uni ishga tushiraman, lekin uning funksiyasini qolda chqirmayman, lekin ni yukla va ichidagi init() funksiyasini yurgiz"
	// lib\pq drayveri ozining init() funksiyasida database/sql tizimiga: "Men 'postgres'driverman PostgreSL bilan ishlashni bilaman"
	// deb ozini royxatdan otkazadi.(sql.Register)
)

//
//
//  0b - "Baza bilan aloqa ornatadi" O‘sha conconfigda topilgan malumotlar bilan PostgreSQLga ulanadi.
// Ushbu faylning vazifasi - config  bergan malumotlarni olib, PostgreSQL bazasi bilan haqiqiy aloqa ornatadi.

func ConnectDb(cfg config.Config) (*sql.DB, error) {
	psqlString := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.PostgresHost,
		cfg.PostgresPort,
		cfg.PostgresUser,
		cfg.PostgresPass,
		cfg.PostgresDb,
	)
	// PostgreSQL bazasi ulanish uchun malum bir formatdagi matnni (DSN - Data Source Name) qabul qiladi. fmt.Sprintf orqali matn yasaladi
	// 	"sslmode=disable" nima degani? Internetdagi katta serverlarda ma'lumotlar shifrlangan SSL orqali uzatiladi.
	// Lokal kompyuteringizda (o'zingiz ishlab o'rganayotganingizda) SSL sertifikati bo'lmagani uchun uni o'chirib qo'yamiz (disable),
	//  aks holda PostgreSQL sertifikat so'rab ulanishga ruxsat bermasligi mumkin.
	conn, err := sql.Open("postgres", psqlString)
	if err != nil {
		fmt.Printf("could not open db connection: %v\n", err)
		return nil, err
	}
	return conn, nil
}

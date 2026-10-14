# TaskFlow API

**Görev ve Proje Yönetim Sistemi REST API'si.** Node.js ve Express.js ile geliştirildi.

Bir yazılım ekibinin görevlerini oluşturmasını, çalışanlara atamasını, durum ve öncelik takibi yapmasını, filtrelemesini ve raporlamasını sağlar.

| Doküman | İçerik |
|---|---|
| [docs/PROJE_TANITIM.md](docs/PROJE_TANITIM.md) | Projenin amacı, senaryosu ve sistem özeti |
| [docs/API.md](docs/API.md) | Tüm endpoint'ler, request/response örnekleri |
| [postman/](postman/) | Postman test koleksiyonu |
| [screenshots/](screenshots/) | Postman test ekran görüntüleri |

---

## Gereksinimler

- [Node.js](https://nodejs.org/) **18 veya üzeri** (`node -v` ile kontrol edebilirsiniz)
- npm (Node.js ile birlikte gelir)
- Testler için [Postman](https://www.postman.com/downloads/) (isteğe bağlı)

## Kurulum

**1. Projeyi indirin**

```bash
git clone https://github.com/barisbirdal/taskflow-api.git
```

```bash
cd taskflow-api
```

**2. Bağımlılıkları kurun**

```bash
npm install
```

**3. Sunucuyu başlatın**

```bash
npm start
```

Konsolda şu mesajı görmelisiniz:

```
TaskFlow API çalışıyor: http://localhost:3000
```

Tarayıcıda `http://localhost:3000` adresini açarak API'nin çalıştığını doğrulayabilirsiniz.

> Port değiştirmek için: `PORT=4000 npm start` (Windows PowerShell'de: `$env:PORT=4000; npm start`)

## npm Komutları

| Komut | Açıklama |
|---|---|
| `npm start` | Sunucuyu başlatır |
| `npm run dev` | Geliştirme modu: dosya değişince sunucu otomatik yeniden başlar (`node --watch`) |
| `npm run seed` | Veriyi örnek veriye (5 görev, 2 proje) sıfırlar |
| `npm test` | Otomatik API testlerini çalıştırır (20 test) |

## Veri Saklama

Veritabanı kurulumu gerekmez. Veriler JSON dosyalarında tutulur:

- `data/seed/` → örnek başlangıç verisi (repoda bulunur)
- `data/db/` → çalışma zamanı verisi (ilk çalıştırmada `seed` klasöründen otomatik oluşturulur, git'e eklenmez)

Sunucu kapatılıp açıldığında veriler kaybolmaz. Baştan başlamak için `npm run seed` çalıştırın.

## Postman ile Test

1. Sunucuyu `npm start` ile başlatın.
2. Postman'de **Import** → `postman/TaskFlow.postman_collection.json` dosyasını seçin.
3. Koleksiyona sağ tıklayıp **Run collection** deyin veya istekleri tek tek gönderin.

`1 - Görev CRUD` klasöründeki istekler sırayla çalıştırılmalıdır: "Görev Ekle" isteği oluşturulan görevin id'sini `taskId` değişkenine kaydeder; diğer istekler bu id'yi kullanır.

Her istekte otomatik test (durum kodu ve cevap içeriği kontrolü) bulunur. Sonuçlar **Test Results** sekmesinde görünür.

## Klasör Yapısı

```
taskflow-api/
├── src/
│   ├── server.js              # Sunucuyu başlatır
│   ├── app.js                 # Express uygulaması, middleware ve route bağlantıları
│   ├── config/index.js        # Port, veri ve log klasörü ayarları
│   ├── routes/                # URL → controller eşleştirmeleri
│   │   ├── index.js           #   /api altındaki tüm route'lar
│   │   ├── taskRoutes.js      #   /api/tasks
│   │   ├── projectRoutes.js   #   /api/projects
│   │   └── reportRoutes.js    #   /api/reports
│   ├── controllers/           # İstek işleme mantığı
│   ├── models/                # JSON dosyası üzerinde CRUD işlemleri
│   ├── middlewares/
│   │   ├── logger.js          #   İstek loglama (konsol + logs/requests.log)
│   │   ├── validate.js        #   Gövde ve id doğrulama
│   │   └── errorHandler.js    #   404 ve merkezi hata yönetimi
│   ├── validators/schemas.js  # Görev ve proje doğrulama kuralları
│   └── utils/                 # Yardımcılar (dosya okuma/yazma, filtre/sıralama/sayfalama)
├── data/seed/                 # Örnek veri
├── scripts/seed.js            # Veriyi sıfırlama betiği
├── tests/api.test.js          # Otomatik testler
├── postman/                   # Postman koleksiyonu
├── screenshots/               # Postman ekran görüntüleri
└── docs/                      # Proje tanıtım ve API dokümanları
```

## Logger

Her istek konsola ve `logs/requests.log` dosyasına şu formatta yazılır:

```
[2026-10-14T11:51:28.456Z] POST /api/tasks 201 - 1.7 ms
```

Sırasıyla: zaman damgası, HTTP method, endpoint, durum kodu, işlem süresi.

## Hızlı Endpoint Özeti

| Method | Endpoint | Açıklama |
|---|---|---|
| POST | `/api/tasks` | Görev ekle |
| GET | `/api/tasks` | Görevleri listele (filtre, sıralama, sayfalama destekli) |
| GET | `/api/tasks/:id` | Görev detayı |
| PUT | `/api/tasks/:id` | Görevi tamamen güncelle |
| PATCH | `/api/tasks/:id` | Görevi kısmen güncelle |
| DELETE | `/api/tasks/:id` | Görev sil |
| GET | `/api/tasks/search?keyword=` | Görev ara |
| GET | `/api/tasks/assignee/:name` | Kişiye atanmış görevler |
| GET | `/api/reports/completed` | Tamamlanan görev sayısı |
| GET | `/api/reports/pending` | Bekleyen görev sayısı |
| GET | `/api/reports/summary` | Genel sistem özeti |
| GET/POST | `/api/projects` | Proje listele / ekle |
| GET/PATCH/DELETE | `/api/projects/:id` | Proje detay / güncelle / sil |
| GET | `/api/projects/:id/tasks` | Projenin görevleri |

Ayrıntılar ve örnekler için: [docs/API.md](docs/API.md)

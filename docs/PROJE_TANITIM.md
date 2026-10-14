# TaskFlow — Proje Tanıtım Dokümanı

**Görev ve Proje Yönetim Sistemi API'si**
Node.js ile Backend Programlama — Bitirme Projesi

---

## 1. Projenin Amacı

TaskFlow, bir yazılım şirketinin ekip içindeki görevleri, projeleri ve çalışanların sorumluluklarını tek bir merkezden takip edebilmesi için geliştirilmiş bir **REST API**'dir.

Proje; Node.js çalışma ortamı, Express.js ile sunucu geliştirme, REST API tasarımı, routing, middleware kullanımı, CRUD operasyonları ve JSON veri yönetimi konularını uygulamalı olarak göstermeyi amaçlar.

## 2. Senaryo

Bir yazılım şirketinde proje yöneticisi yeni bir iş geldiğinde sisteme bir **görev** ekler. Göreve başlık, açıklama, öncelik, son tarih ve sorumlu çalışan bilgisi girer; görevi ilgili **projeye** bağlar.

Çalışan göreve başladığında görevin durumunu `todo` → `in-progress`, bitirdiğinde `completed` olarak günceller. Yönetici:

- yüksek öncelikli görevleri filtreleyerek önce bunlara odaklanır,
- bir çalışanın üzerindeki tüm görevleri listeler,
- anahtar kelimeyle görev arar,
- rapor uçlarından tamamlanan/bekleyen görev sayısını, tamamlanma oranını ve gecikmiş görevleri görür.

## 3. Sistem Özellikleri

### Zorunlu kapsam

| Özellik | Endpoint |
|---|---|
| Görev ekleme | `POST /api/tasks` |
| Görev listeleme | `GET /api/tasks` |
| Görev detayı | `GET /api/tasks/:id` |
| Görev güncelleme | `PUT /api/tasks/:id`, `PATCH /api/tasks/:id` |
| Görev silme | `DELETE /api/tasks/:id` |
| Logger middleware | Tüm istekler → konsol + `logs/requests.log` |

### İsteğe bağlı (ileri seviye) kapsam: tamamı uygulandı

| Pratik | Uygulama |
|---|---|
| **1. Gelişmiş API özellikleri** | `?status=`, `?priority=`, `?sort=`, `?page=&limit=`, `/tasks/search?keyword=`, `/tasks/assignee/:name` |
| **2. Validation middleware** | `title`, `description`, `priority`, `assignee`, `status`, `projectId`, `dueDate` alanları doğrulanır; hatada 400 ve alan bazlı açıklama döner |
| **3. Raporlama servisleri** | `/reports/completed`, `/reports/pending`, `/reports/summary` |
| **4. Kapsamlı dokümantasyon** | API dokümanı ([API.md](API.md)), Postman koleksiyonu (otomatik testli), README, 20 otomatik test |

### Ek olarak

- **Proje modülü:** projeler için CRUD; görevler projelere bağlanabilir. Görevi olan proje silinemez (409).
- **Merkezi hata yönetimi:** tüm hatalar `{ success: false, message, errors? }` formatında döner. Tanımsız endpoint 404, bozuk JSON 400 döner.

## 4. Veri Modeli

### Görev (Task)

| Alan | Tip | Kural | Varsayılan |
|---|---|---|---|
| `id` | number | Otomatik artan | — |
| `title` | string | **Zorunlu**, 3–100 karakter | — |
| `description` | string | En fazla 500 karakter | `""` |
| `status` | string | `todo`, `in-progress`, `completed` | `todo` |
| `priority` | string | `low`, `medium`, `high` | `medium` |
| `assignee` | string \| null | 2–50 karakter | `null` |
| `projectId` | number \| null | Var olan bir proje olmalı | `null` |
| `dueDate` | string \| null | `YYYY-MM-DD` | `null` |
| `createdAt` | string | ISO tarih, otomatik | — |
| `updatedAt` | string | ISO tarih, otomatik | — |

### Proje (Project)

| Alan | Tip | Kural |
|---|---|---|
| `id` | number | Otomatik artan |
| `name` | string | **Zorunlu**, 3–100 karakter |
| `description` | string | En fazla 500 karakter |
| `createdAt`, `updatedAt` | string | Otomatik |

İlişki: Bir proje birden çok göreve sahip olabilir (`Task.projectId → Project.id`).

## 5. Mimari

İstek, katmanlı bir yapı içinden geçer:

```
İstek → express.json() → logger → router → validateId / validateBody → controller → model → JSON dosyası
                                                                              ↓
                                         Cevap ← errorHandler (hata varsa) ← controller
```

| Katman | Görev |
|---|---|
| `routes/` | Hangi URL'nin hangi controller fonksiyonuna gideceğini belirler |
| `middlewares/` | Loglama, doğrulama, hata yönetimi |
| `controllers/` | İş mantığı: filtreleme, varsayılan değerler, ilişki kontrolleri |
| `models/` | Veri erişimi: JSON dosyasına okuma/yazma |

Veriler bir veritabanı yerine `data/db/*.json` dosyalarında saklanır, böylece proje ek kurulum gerektirmeden çalışır. Model katmanı ayrı tutulduğu için ileride MongoDB/PostgreSQL'e geçiş yalnızca `models/` klasörünü değiştirmeyi gerektirir.

## 6. Kullanılan Teknolojiler

- **Node.js** (v18+): çalışma ortamı
- **Express.js** (v4): web framework
- **Node.js test runner** (`node:test`): otomatik testler (ek paket gerektirmez)
- **Postman**: manuel ve otomatik API testleri

## 7. Test

- **Postman:** `postman/TaskFlow.postman_collection.json`: 33 istek, 47 otomatik kontrol (CRUD, hata senaryoları, filtreleme, raporlar, projeler). Ekran görüntüleri `screenshots/` klasöründedir.
- **Otomatik testler:** `npm test`: 20 test, geçici bir veri klasörü üzerinde çalışır.

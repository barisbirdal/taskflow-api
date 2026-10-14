# TaskFlow API Dokümantasyonu

**Base URL:** `http://localhost:3000/api`

Tüm istek ve cevap gövdeleri JSON formatındadır. Gövde gönderen isteklerde `Content-Type: application/json` başlığı kullanılmalıdır.

## İçindekiler

- [Cevap Formatı](#cevap-formatı)
- [Durum Kodları](#durum-kodları)
- [Görevler](#görevler)
  - [Görev Ekle](#görev-ekle) · [Görevleri Listele](#görevleri-listele) · [Görev Detayı](#görev-detayı) · [Görev Güncelle (PUT)](#görev-güncelle-put) · [Görev Güncelle (PATCH)](#görev-güncelle-patch) · [Görev Sil](#görev-sil)
  - [Görev Ara](#görev-ara) · [Kullanıcı Bazlı Listeleme](#kullanıcı-bazlı-listeleme)
- [Raporlar](#raporlar)
- [Projeler](#projeler)
- [Doğrulama Kuralları](#doğrulama-kuralları)

---

## Cevap Formatı

**Başarılı:**

```json
{ "success": true, "message": "...", "data": { } }
```

**Hatalı:**

```json
{
  "success": false,
  "message": "Doğrulama hatası",
  "errors": [{ "field": "title", "message": "title alanı zorunludur" }]
}
```

`errors` dizisi yalnızca doğrulama hatalarında bulunur.

## Durum Kodları

| Kod | Anlamı | Ne zaman |
|---|---|---|
| 200 | OK | Başarılı okuma, güncelleme, silme |
| 201 | Created | Kayıt oluşturuldu |
| 400 | Bad Request | Eksik/geçersiz alan, geçersiz id, geçersiz sorgu parametresi, bozuk JSON |
| 404 | Not Found | Kayıt veya endpoint bulunamadı |
| 409 | Conflict | Görevi olan proje silinmeye çalışıldı |
| 500 | Internal Server Error | Beklenmeyen sunucu hatası |

---

## Görevler

### Görev Ekle

`POST /api/tasks`

Yalnızca `title` zorunludur; gönderilmeyen alanlar varsayılan değeri alır.

**İstek:**

```json
{
  "title": "API dokümantasyonunu yaz",
  "description": "Tüm endpointler için request/response örnekleri",
  "priority": "high",
  "assignee": "Musa",
  "projectId": 1,
  "dueDate": "2026-10-30"
}
```

**Cevap: `201 Created`**

```json
{
  "success": true,
  "message": "Görev oluşturuldu",
  "data": {
    "id": 6,
    "title": "API dokümantasyonunu yaz",
    "description": "Tüm endpointler için request/response örnekleri",
    "status": "todo",
    "priority": "high",
    "assignee": "Musa",
    "projectId": 1,
    "dueDate": "2026-10-30",
    "createdAt": "2026-10-14T11:52:24.728Z",
    "updatedAt": "2026-10-14T11:52:24.728Z"
  }
}
```

**Hatalı istek: `400 Bad Request`**

```json
{ "title": "ab", "priority": "urgent" }
```

```json
{
  "success": false,
  "message": "Doğrulama hatası",
  "errors": [
    { "field": "title", "message": "title en az 3 karakter olmalıdır" },
    { "field": "priority", "message": "priority şu değerlerden biri olmalıdır: low, medium, high" }
  ]
}
```

---

### Görevleri Listele

`GET /api/tasks`

Tüm sorgu parametreleri isteğe bağlıdır ve birlikte kullanılabilir.

| Parametre | Örnek | Açıklama |
|---|---|---|
| `status` | `?status=completed` | Duruma göre filtre (`todo`, `in-progress`, `completed`) |
| `priority` | `?priority=high` | Önceliğe göre filtre (`low`, `medium`, `high`) |
| `assignee` | `?assignee=musa` | Sorumluya göre filtre (büyük/küçük harf duyarsız) |
| `projectId` | `?projectId=1` | Projeye göre filtre |
| `sort` | `?sort=createdAt`, `?sort=-priority` | Sıralama. Alanlar: `createdAt`, `updatedAt`, `title`, `priority`, `status`, `dueDate`. Azalan sıra için başına `-` konur. |
| `page` | `?page=2` | Sayfa numarası (varsayılan 1) |
| `limit` | `?limit=10` | Sayfa başına kayıt (en fazla 100). Verilmezse tüm kayıtlar döner. |

**Örnek:** `GET /api/tasks?status=completed&page=1&limit=1`

**Cevap: `200 OK`**

```json
{
  "success": true,
  "count": 1,
  "total": 2,
  "page": 1,
  "totalPages": 2,
  "data": [
    {
      "id": 1,
      "title": "Backend klasör yapısını oluştur",
      "description": "routes, controllers, middlewares ve models klasörlerini hazırla",
      "status": "completed",
      "priority": "high",
      "assignee": "Musa",
      "projectId": 1,
      "dueDate": "2026-10-05",
      "createdAt": "2026-10-01T10:00:00.000Z",
      "updatedAt": "2026-10-04T15:30:00.000Z"
    }
  ]
}
```

- `count`: bu sayfadaki kayıt sayısı
- `total`: filtreye uyan toplam kayıt sayısı

Geçersiz değerler (`?status=done`, `?sort=foo`, `?page=0`) `400` döner.

---

### Görev Detayı

`GET /api/tasks/:id`

**Cevap: `200 OK`**

```json
{ "success": true, "data": { "id": 1, "title": "Backend klasör yapısını oluştur", "...": "..." } }
```

**Bulunamadı: `404 Not Found`**

```json
{ "success": false, "message": "6 id'li görev bulunamadı" }
```

**Geçersiz id (`/api/tasks/abc`): `400 Bad Request`**

```json
{ "success": false, "message": "Geçersiz id: \"abc\". id pozitif bir tam sayı olmalıdır" }
```

---

### Görev Güncelle (PUT)

`PUT /api/tasks/:id`

Görevi **tamamen** değiştirir. `title` zorunludur; gönderilmeyen alanlar varsayılan değerlerine döner.

**İstek:**

```json
{
  "title": "API dokümantasyonunu tamamla",
  "description": "Request/response örnekleri eklendi",
  "status": "completed",
  "priority": "high",
  "assignee": "Ayşe",
  "projectId": 1,
  "dueDate": "2026-10-28"
}
```

**Cevap: `200 OK`**

```json
{ "success": true, "message": "Görev güncellendi", "data": { "id": 6, "title": "API dokümantasyonunu tamamla", "...": "..." } }
```

---

### Görev Güncelle (PATCH)

`PATCH /api/tasks/:id`

Yalnızca **gönderilen alanları** günceller. En az bir alan gönderilmelidir.

**İstek:**

```json
{ "status": "in-progress" }
```

**Cevap: `200 OK`**

```json
{
  "success": true,
  "message": "Görev güncellendi",
  "data": {
    "id": 6,
    "title": "API dokümantasyonunu yaz",
    "status": "in-progress",
    "priority": "high",
    "...": "...",
    "updatedAt": "2026-10-14T11:52:24.807Z"
  }
}
```

**Boş gövde: `400 Bad Request`**

```json
{
  "success": false,
  "message": "Doğrulama hatası",
  "errors": [{ "field": null, "message": "Güncellenecek en az bir alan gönderilmelidir: title, description, status, priority, assignee, projectId, dueDate" }]
}
```

---

### Görev Sil

`DELETE /api/tasks/:id`

**Cevap: `200 OK`** (silinen görev döner)

```json
{ "success": true, "message": "Görev silindi", "data": { "id": 6, "...": "..." } }
```

---

### Görev Ara

`GET /api/tasks/search?keyword=<kelime>`

Başlık ve açıklamada büyük/küçük harf duyarsız arama yapar. Listeleme parametreleri (`status`, `sort`, `page`, `limit`...) burada da kullanılabilir.

**Örnek:** `GET /api/tasks/search?keyword=logger`

```json
{
  "success": true,
  "keyword": "logger",
  "count": 1,
  "total": 1,
  "page": 1,
  "totalPages": 1,
  "data": [{ "id": 2, "title": "Logger middleware yaz", "...": "..." }]
}
```

`keyword` gönderilmezse `400` döner.

---

### Kullanıcı Bazlı Listeleme

`GET /api/tasks/assignee/:name`

**Örnek:** `GET /api/tasks/assignee/musa`. "Musa" adlı kişiye atanmış tüm görevler döner (büyük/küçük harf duyarsız). Listeleme parametreleri kullanılabilir.

---

## Raporlar

### Tamamlanan Görev Sayısı

`GET /api/reports/completed`

```json
{ "success": true, "data": { "completed": 2 } }
```

### Bekleyen Görev Sayısı

`GET /api/reports/pending`

Tamamlanmamış (`todo` + `in-progress`) görevler.

```json
{
  "success": true,
  "data": {
    "pending": 3,
    "byStatus": { "in-progress": 1, "todo": 2 },
    "byPriority": { "high": 1, "medium": 1, "low": 1 }
  }
}
```

### Genel Sistem Özeti

`GET /api/reports/summary`

```json
{
  "success": true,
  "data": {
    "totalTasks": 5,
    "completed": 2,
    "pending": 3,
    "completionRate": 40,
    "overdue": 0,
    "byStatus": { "completed": 2, "in-progress": 1, "todo": 2 },
    "byPriority": { "high": 2, "medium": 2, "low": 1 },
    "byAssignee": { "Musa": 2, "Ayşe": 2, "Zeynep": 1 }
  }
}
```

- `completionRate`: tamamlanma yüzdesi
- `overdue`: son tarihi geçmiş ve tamamlanmamış görev sayısı

---

## Projeler

| Method | Endpoint | Açıklama | Başarılı |
|---|---|---|---|
| GET | `/api/projects` | Tüm projeler | 200 |
| GET | `/api/projects/:id` | Proje detayı | 200 |
| GET | `/api/projects/:id/tasks` | Projeye bağlı görevler | 200 |
| POST | `/api/projects` | Proje ekle | 201 |
| PATCH | `/api/projects/:id` | Proje güncelle (kısmi) | 200 |
| DELETE | `/api/projects/:id` | Proje sil | 200 |

**Proje ekle: istek:**

```json
{ "name": "Mobil Uygulama", "description": "iOS ve Android uygulaması" }
```

**Görevi olan projeyi silme: `409 Conflict`**

```json
{ "success": false, "message": "Bu projeye bağlı 4 görev var. Önce görevleri silin veya başka projeye taşıyın" }
```

---

## Doğrulama Kuralları

### Görev

| Alan | Kural |
|---|---|
| `title` | **Zorunlu** (POST, PUT), metin, 3–100 karakter |
| `description` | Metin, en fazla 500 karakter |
| `status` | `todo` · `in-progress` · `completed` |
| `priority` | `low` · `medium` · `high` |
| `assignee` | Metin, 2–50 karakter veya `null` |
| `projectId` | Pozitif tam sayı, var olan bir proje veya `null` |
| `dueDate` | `YYYY-MM-DD` formatında tarih veya `null` |

### Proje

| Alan | Kural |
|---|---|
| `name` | **Zorunlu** (POST), metin, 3–100 karakter |
| `description` | Metin, en fazla 500 karakter |

### Genel davranış

- Metin alanlarının başındaki ve sonundaki boşluklar temizlenir.
- Şemada olmayan alanlar (`id`, `createdAt` vb.) yok sayılır; bunlar istemci tarafından değiştirilemez.
- Bozuk JSON gövdesi `400 Geçersiz JSON formatı` döner.
- Tanımsız endpoint'ler `404` döner.

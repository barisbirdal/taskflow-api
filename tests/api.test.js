/**
 * Otomatik API testleri (Node.js'in yerleşik test modülü ile, ek paket gerektirmez).
 * Çalıştırma: npm test
 *
 * Testler geçici bir veri klasörü kullanır; data/db içindeki gerçek veriye dokunmaz.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskflow-test-'));
process.env.DATA_DIR = tmpDir;
process.env.LOG_TO_FILE = 'false';
process.env.LOG_TO_CONSOLE = 'false';

const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(() => {
  server.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

async function request(method, url, body) {
  const res = await fetch(baseUrl + url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

// ---------- CRUD ----------

let createdId;

test('POST /tasks yeni görev oluşturur (201)', async () => {
  const res = await request('POST', '/tasks', {
    title: '  Test görevi  ',
    priority: 'high',
    assignee: 'Musa',
    projectId: 1,
  });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.data.title, 'Test görevi');
  assert.strictEqual(res.body.data.status, 'todo');
  assert.ok(res.body.data.createdAt);
  createdId = res.body.data.id;
});

test('GET /tasks tüm görevleri listeler', async () => {
  const res = await request('GET', '/tasks');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.data.some((t) => t.id === createdId));
  assert.strictEqual(res.body.total, res.body.data.length);
});

test('GET /tasks/:id görev detayını döner', async () => {
  const res = await request('GET', `/tasks/${createdId}`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.id, createdId);
});

test('PATCH /tasks/:id sadece gönderilen alanı günceller', async () => {
  const res = await request('PATCH', `/tasks/${createdId}`, { status: 'completed' });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.status, 'completed');
  assert.strictEqual(res.body.data.priority, 'high');
});

test('PUT /tasks/:id görevi tamamen değiştirir', async () => {
  const res = await request('PUT', `/tasks/${createdId}`, { title: 'Yeniden yazıldı' });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.title, 'Yeniden yazıldı');
  assert.strictEqual(res.body.data.priority, 'medium'); // varsayılana döndü
});

test('DELETE /tasks/:id görevi siler, sonra 404 döner', async () => {
  const del = await request('DELETE', `/tasks/${createdId}`);
  assert.strictEqual(del.status, 200);
  const get = await request('GET', `/tasks/${createdId}`);
  assert.strictEqual(get.status, 404);
});

// ---------- Hata durumları ----------

test('Eksik title ile POST 400 döner', async () => {
  const res = await request('POST', '/tasks', { priority: 'urgent' });
  assert.strictEqual(res.status, 400);
  const fields = res.body.errors.map((e) => e.field);
  assert.deepStrictEqual(fields.sort(), ['priority', 'title']);
});

test('Bozuk JSON 400 döner', async () => {
  const res = await request('POST', '/tasks', '{ "title": ');
  assert.strictEqual(res.status, 400);
});

test('Geçersiz id 400, olmayan id 404 döner', async () => {
  assert.strictEqual((await request('GET', '/tasks/abc')).status, 400);
  assert.strictEqual((await request('GET', '/tasks/9999')).status, 404);
});

test('Olmayan projeye görev bağlanamaz', async () => {
  const res = await request('POST', '/tasks', { title: 'Projesiz', projectId: 999 });
  assert.strictEqual(res.status, 400);
});

test('Tanımsız endpoint 404 döner', async () => {
  assert.strictEqual((await request('GET', '/olmayan')).status, 404);
});

// ---------- Filtreleme / arama / sayfalama ----------

test('status ve priority filtresi çalışır', async () => {
  const res = await request('GET', '/tasks?status=completed&priority=high');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.data.length > 0);
  assert.ok(res.body.data.every((t) => t.status === 'completed' && t.priority === 'high'));
});

test('Geçersiz filtre değeri 400 döner', async () => {
  assert.strictEqual((await request('GET', '/tasks?status=done')).status, 400);
  assert.strictEqual((await request('GET', '/tasks?sort=foo')).status, 400);
});

test('Arama büyük/küçük harf duyarsızdır', async () => {
  const res = await request('GET', '/tasks/search?keyword=BACKEND');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.data.length >= 2);
});

test('Kullanıcı bazlı listeleme', async () => {
  const res = await request('GET', '/tasks/assignee/musa');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.data.every((t) => t.assignee.toLowerCase() === 'musa'));
});

test('Sayfalama page ve limit ile çalışır', async () => {
  const res = await request('GET', '/tasks?page=2&limit=2&sort=createdAt');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.page, 2);
  assert.strictEqual(res.body.count, 2);
  assert.deepStrictEqual(res.body.data.map((t) => t.id), [3, 4]);
});

test('Azalan sıralamada boş dueDate en sonda kalır', async () => {
  const res = await request('GET', '/tasks?sort=-dueDate');
  const last = res.body.data[res.body.data.length - 1];
  assert.strictEqual(last.dueDate, null);
});

// ---------- Raporlar ----------

test('Rapor endpointleri tutarlı sayılar döner', async () => {
  const summary = (await request('GET', '/reports/summary')).body.data;
  const completed = (await request('GET', '/reports/completed')).body.data.completed;
  const pending = (await request('GET', '/reports/pending')).body.data.pending;
  assert.strictEqual(summary.completed, completed);
  assert.strictEqual(summary.pending, pending);
  assert.strictEqual(summary.totalTasks, completed + pending);
});

// ---------- Projeler ----------

test('Görevi olan proje silinemez (409)', async () => {
  assert.strictEqual((await request('DELETE', '/projects/1')).status, 409);
});

test('Proje oluşturma ve silme', async () => {
  const created = await request('POST', '/projects', { name: 'Mobil Uygulama' });
  assert.strictEqual(created.status, 201);
  const del = await request('DELETE', `/projects/${created.body.data.id}`);
  assert.strictEqual(del.status, 200);
});

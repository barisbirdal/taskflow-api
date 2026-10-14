const fs = require('fs');
const path = require('path');
const { dataDir, seedDir } = require('../config');

/**
 * JSON dosyası tabanlı basit veri katmanı.
 * Her koleksiyon (tasks, projects) data/db/<koleksiyon>.json dosyasında tutulur.
 * Dosya yoksa data/seed klasöründeki örnek veriden kopyalanır.
 */

function filePath(collection) {
  return path.join(dataDir, `${collection}.json`);
}

function ensureCollection(collection) {
  const target = filePath(collection);
  if (fs.existsSync(target)) return;

  fs.mkdirSync(dataDir, { recursive: true });
  const seedFile = path.join(seedDir, `${collection}.json`);
  const initial = fs.existsSync(seedFile) ? fs.readFileSync(seedFile, 'utf-8') : '[]';
  fs.writeFileSync(target, initial, 'utf-8');
}

function readAll(collection) {
  ensureCollection(collection);
  const raw = fs.readFileSync(filePath(collection), 'utf-8');
  return JSON.parse(raw || '[]');
}

function writeAll(collection, items) {
  ensureCollection(collection);
  fs.writeFileSync(filePath(collection), JSON.stringify(items, null, 2), 'utf-8');
}

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

module.exports = { readAll, writeAll, nextId };

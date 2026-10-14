/**
 * Çalışma zamanı verisini (data/db) örnek veriye (data/seed) sıfırlar.
 * Kullanım: npm run seed
 */
const fs = require('fs');
const path = require('path');
const { dataDir, seedDir } = require('../src/config');

fs.mkdirSync(dataDir, { recursive: true });

for (const file of fs.readdirSync(seedDir)) {
  if (!file.endsWith('.json')) continue;
  fs.copyFileSync(path.join(seedDir, file), path.join(dataDir, file));
  console.log(`✔ ${file} örnek veriye sıfırlandı`);
}

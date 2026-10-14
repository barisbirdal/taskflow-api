const path = require('path');

const rootDir = path.join(__dirname, '..', '..');

module.exports = {
  port: Number(process.env.PORT) || 3000,
  // Çalışma zamanı verisinin tutulduğu klasör (testlerde farklı bir klasör verilebilir)
  dataDir: process.env.DATA_DIR || path.join(rootDir, 'data', 'db'),
  seedDir: path.join(rootDir, 'data', 'seed'),
  logDir: process.env.LOG_DIR || path.join(rootDir, 'logs'),
  // LOG_TO_FILE=false ile dosyaya yazma kapatılabilir
  logToFile: process.env.LOG_TO_FILE !== 'false',
  logToConsole: process.env.LOG_TO_CONSOLE !== 'false',
};

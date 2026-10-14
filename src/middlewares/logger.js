const fs = require('fs');
const path = require('path');
const { logDir, logToFile, logToConsole } = require('../config');

const logFile = path.join(logDir, 'requests.log');

if (logToFile) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Logger middleware
 * Her isteğin method, endpoint ve zaman damgasını kaydeder.
 * Cevap gönderildiğinde durum kodu ve süre de satıra eklenir.
 * Kayıtlar konsola ve logs/requests.log dosyasına yazılır.
 *
 * Örnek satır:
 * [2026-10-14T11:42:07.123Z] POST /api/tasks 201 - 12.4 ms
 */
function logger(req, res, next) {
  const timestamp = new Date().toISOString();
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const line = `[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs.toFixed(1)} ms`;

    if (logToConsole) console.log(line);
    if (logToFile) {
      fs.appendFile(logFile, line + '\n', (err) => {
        if (err) console.error('Log dosyasına yazılamadı:', err.message);
      });
    }
  });

  next();
}

module.exports = logger;

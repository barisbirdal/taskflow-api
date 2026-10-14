const express = require('express');
const logger = require('./middlewares/logger');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

// --- Genel middleware'ler ---
app.use(express.json());
app.use(logger);

// --- Ana sayfa: API hakkında kısa bilgi ---
app.get('/', (req, res) => {
  res.json({
    name: 'TaskFlow API',
    description: 'Görev ve Proje Yönetim Sistemi REST API',
    version: '1.0.0',
    endpoints: {
      tasks: '/api/tasks',
      projects: '/api/projects',
      reports: '/api/reports/summary',
    },
  });
});

// --- API route'ları (/api ve doğrudan kök yoldan erişilebilir) ---
app.use('/api', routes);
app.use('/', routes);

// --- Hata yönetimi (her zaman en sonda) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;

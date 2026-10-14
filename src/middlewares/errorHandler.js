const ApiError = require('../utils/ApiError');

/**
 * Tanımsız route'lar için 404 cevabı üretir.
 */
function notFound(req, res, next) {
  next(new ApiError(404, `Endpoint bulunamadı: ${req.method} ${req.originalUrl}`));
}

/**
 * Merkezi hata yakalayıcı. Tüm hatalar burada standart JSON formatına çevrilir:
 * { success: false, message: '...', errors?: [...] }
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // express.json() bozuk JSON gövdesi aldığında
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Geçersiz JSON formatı' });
  }

  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const body = {
    success: false,
    message: statusCode === 500 ? 'Sunucu hatası' : err.message,
  };
  if (err.details) body.errors = err.details;

  if (statusCode === 500) console.error(err);

  res.status(statusCode).json(body);
}

module.exports = { notFound, errorHandler };

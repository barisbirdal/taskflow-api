/**
 * HTTP durum kodu taşıyan hata sınıfı.
 * Controller'larda `throw new ApiError(404, '...')` şeklinde kullanılır,
 * errorHandler middleware'i tarafından JSON cevaba dönüştürülür.
 */
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = ApiError;

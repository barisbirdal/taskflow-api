const ApiError = require('../utils/ApiError');

/**
 * Validation middleware fabrikası.
 *
 * Şema örneği:
 *   { title: { type: 'string', required: true, min: 3, max: 100 },
 *     priority: { enum: ['low', 'medium', 'high'] } }
 *
 * - partial: true  → PATCH için; zorunlu alan kontrolü yapılmaz,
 *                    ancak en az bir alan gönderilmelidir.
 * - Şemada olmayan alanlar req.body'den çıkarılır (ör. id, createdAt).
 * - String alanların başındaki/sonundaki boşluklar temizlenir.
 * - Hata varsa 400 Bad Request ve alan bazlı hata listesi döner.
 */
function validateBody(schema, { partial = false } = {}) {
  return (req, res, next) => {
    const body = req.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return next(new ApiError(400, 'İstek gövdesi JSON nesnesi olmalıdır'));
    }

    const errors = [];
    const clean = {};

    for (const [field, rule] of Object.entries(schema)) {
      let value = body[field];
      const isMissing = value === undefined || value === '';

      if (isMissing) {
        if (rule.required && !partial) {
          errors.push({ field, message: `${field} alanı zorunludur` });
        }
        continue;
      }

      if (value === null) {
        if (rule.nullable) clean[field] = null;
        else errors.push({ field, message: `${field} alanı boş (null) olamaz` });
        continue;
      }

      const error = checkRule(field, value, rule);
      if (error) {
        errors.push({ field, message: error });
        continue;
      }

      if (typeof value === 'string') value = value.trim();
      clean[field] = value;
    }

    if (partial && errors.length === 0 && Object.keys(clean).length === 0) {
      errors.push({
        field: null,
        message: `Güncellenecek en az bir alan gönderilmelidir: ${Object.keys(schema).join(', ')}`,
      });
    }

    if (errors.length > 0) {
      return next(new ApiError(400, 'Doğrulama hatası', errors));
    }

    req.body = clean;
    next();
  };
}

function checkRule(field, value, rule) {
  if (rule.enum) {
    if (!rule.enum.includes(value)) {
      return `${field} şu değerlerden biri olmalıdır: ${rule.enum.join(', ')}`;
    }
    return null;
  }

  switch (rule.type) {
    case 'string': {
      if (typeof value !== 'string') return `${field} metin (string) olmalıdır`;
      const length = value.trim().length;
      if (rule.min && length < rule.min) return `${field} en az ${rule.min} karakter olmalıdır`;
      if (rule.max && length > rule.max) return `${field} en fazla ${rule.max} karakter olabilir`;
      return null;
    }
    case 'integer':
      if (!Number.isInteger(value) || value < 1) return `${field} pozitif bir tam sayı olmalıdır`;
      return null;
    case 'date':
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value) || Number.isNaN(Date.parse(value))) {
        return `${field} geçerli bir tarih olmalıdır (YYYY-MM-DD)`;
      }
      return null;
    default:
      return null;
  }
}

/**
 * URL'deki :id parametresinin pozitif tam sayı olduğunu kontrol eder
 * ve req.params.id'yi sayıya çevirir.
 */
function validateId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return next(new ApiError(400, `Geçersiz id: "${req.params.id}". id pozitif bir tam sayı olmalıdır`));
  }
  req.params.id = id;
  next();
}

module.exports = { validateBody, validateId };

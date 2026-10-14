const ApiError = require('./ApiError');
const { STATUSES, PRIORITIES } = require('../models/taskModel');

const SORTABLE_FIELDS = ['createdAt', 'updatedAt', 'title', 'priority', 'status', 'dueDate'];
const PRIORITY_ORDER = { low: 1, medium: 2, high: 3 };
const STATUS_ORDER = { todo: 1, 'in-progress': 2, completed: 3 };
const MAX_LIMIT = 100;

const normalize = (text) => String(text).toLocaleLowerCase('tr-TR');

/**
 * Görev listesine query string'e göre filtre, sıralama ve sayfalama uygular.
 *
 * Desteklenen parametreler:
 *   status=todo|in-progress|completed
 *   priority=low|medium|high
 *   assignee=<isim>        (büyük/küçük harf duyarsız)
 *   projectId=<sayı>
 *   sort=<alan> | -<alan>  (ör. sort=createdAt, sort=-priority)
 *   page=<sayı>&limit=<sayı>
 */
function applyListQuery(tasks, query) {
  let result = [...tasks];

  // --- Filtreleme ---
  if (query.status !== undefined) {
    if (!STATUSES.includes(query.status)) {
      throw new ApiError(400, `status şu değerlerden biri olmalıdır: ${STATUSES.join(', ')}`);
    }
    result = result.filter((t) => t.status === query.status);
  }

  if (query.priority !== undefined) {
    if (!PRIORITIES.includes(query.priority)) {
      throw new ApiError(400, `priority şu değerlerden biri olmalıdır: ${PRIORITIES.join(', ')}`);
    }
    result = result.filter((t) => t.priority === query.priority);
  }

  if (query.assignee !== undefined) {
    const assignee = normalize(query.assignee);
    result = result.filter((t) => t.assignee && normalize(t.assignee) === assignee);
  }

  if (query.projectId !== undefined) {
    const projectId = parsePositiveInt(query.projectId, 'projectId');
    result = result.filter((t) => t.projectId === projectId);
  }

  // --- Sıralama ---
  if (query.sort !== undefined) {
    const desc = query.sort.startsWith('-');
    const field = desc ? query.sort.slice(1) : query.sort;
    if (!SORTABLE_FIELDS.includes(field)) {
      throw new ApiError(400, `sort şu alanlardan biri olmalıdır: ${SORTABLE_FIELDS.join(', ')} (azalan için başına - koyun)`);
    }
    result.sort((a, b) => compareBy(field, a, b, desc));
  }

  // --- Sayfalama ---
  const total = result.length;
  const page = query.page !== undefined ? parsePositiveInt(query.page, 'page') : 1;
  const limit = query.limit !== undefined ? parsePositiveInt(query.limit, 'limit') : null;

  if (limit !== null && limit > MAX_LIMIT) {
    throw new ApiError(400, `limit en fazla ${MAX_LIMIT} olabilir`);
  }

  if (limit !== null) {
    result = result.slice((page - 1) * limit, page * limit);
  }

  return {
    count: result.length,
    total,
    page,
    totalPages: limit ? Math.max(1, Math.ceil(total / limit)) : 1,
    data: result,
  };
}

function compareBy(field, a, b, desc) {
  const va = a[field];
  const vb = b[field];

  // Boş değerler (ör. dueDate: null) sıralama yönünden bağımsız olarak en sona gelsin
  if (va == null && vb == null) return 0;
  if (va == null) return 1;
  if (vb == null) return -1;

  let diff;
  if (field === 'priority') diff = PRIORITY_ORDER[va] - PRIORITY_ORDER[vb];
  else if (field === 'status') diff = STATUS_ORDER[va] - STATUS_ORDER[vb];
  else diff = String(va).localeCompare(String(vb), 'tr-TR');

  return desc ? -diff : diff;
}

function parsePositiveInt(value, name) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    throw new ApiError(400, `${name} pozitif bir tam sayı olmalıdır`);
  }
  return number;
}

module.exports = { applyListQuery, normalize };

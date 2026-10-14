const Task = require('../models/taskModel');
const Project = require('../models/projectModel');
const ApiError = require('../utils/ApiError');
const { applyListQuery, normalize } = require('../utils/listQuery');

// Yeni görevde gönderilmeyen alanların varsayılan değerleri
const DEFAULTS = {
  description: '',
  status: 'todo',
  priority: 'medium',
  assignee: null,
  projectId: null,
  dueDate: null,
};

function findTaskOr404(id) {
  const task = Task.findById(id);
  if (!task) throw new ApiError(404, `${id} id'li görev bulunamadı`);
  return task;
}

function ensureProjectExists(projectId) {
  if (projectId != null && !Project.findById(projectId)) {
    throw new ApiError(400, `${projectId} id'li proje bulunamadı`);
  }
}

// GET /api/tasks
function getTasks(req, res) {
  const result = applyListQuery(Task.findAll(), req.query);
  res.json({ success: true, ...result });
}

// GET /api/tasks/search?keyword=backend
function searchTasks(req, res) {
  const keyword = (req.query.keyword || '').trim();
  if (!keyword) throw new ApiError(400, 'keyword parametresi zorunludur');

  const needle = normalize(keyword);
  const matches = Task.findAll().filter(
    (t) => normalize(t.title).includes(needle) || normalize(t.description).includes(needle)
  );

  const { keyword: _ignored, ...rest } = req.query;
  const result = applyListQuery(matches, rest);
  res.json({ success: true, keyword, ...result });
}

// GET /api/tasks/assignee/:name
function getTasksByAssignee(req, res) {
  const result = applyListQuery(Task.findAll(), { ...req.query, assignee: req.params.name });
  res.json({ success: true, assignee: req.params.name, ...result });
}

// GET /api/tasks/:id
function getTaskById(req, res) {
  res.json({ success: true, data: findTaskOr404(req.params.id) });
}

// POST /api/tasks
function createTask(req, res) {
  const data = { title: req.body.title, ...DEFAULTS, ...req.body };
  ensureProjectExists(data.projectId);

  const task = Task.create(data);
  res.status(201).json({ success: true, message: 'Görev oluşturuldu', data: task });
}

// PUT /api/tasks/:id  → görevin tamamını değiştirir (gönderilmeyen alanlar varsayılana döner)
function replaceTask(req, res) {
  findTaskOr404(req.params.id);
  const data = { title: req.body.title, ...DEFAULTS, ...req.body };
  ensureProjectExists(data.projectId);

  const task = Task.update(req.params.id, data);
  res.json({ success: true, message: 'Görev güncellendi', data: task });
}

// PATCH /api/tasks/:id  → sadece gönderilen alanları günceller
function updateTask(req, res) {
  findTaskOr404(req.params.id);
  ensureProjectExists(req.body.projectId);

  const task = Task.update(req.params.id, req.body);
  res.json({ success: true, message: 'Görev güncellendi', data: task });
}

// DELETE /api/tasks/:id
function deleteTask(req, res) {
  findTaskOr404(req.params.id);
  const task = Task.remove(req.params.id);
  res.json({ success: true, message: 'Görev silindi', data: task });
}

module.exports = {
  getTasks,
  searchTasks,
  getTasksByAssignee,
  getTaskById,
  createTask,
  replaceTask,
  updateTask,
  deleteTask,
};

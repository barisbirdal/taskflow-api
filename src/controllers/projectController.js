const Project = require('../models/projectModel');
const Task = require('../models/taskModel');
const ApiError = require('../utils/ApiError');

function findProjectOr404(id) {
  const project = Project.findById(id);
  if (!project) throw new ApiError(404, `${id} id'li proje bulunamadı`);
  return project;
}

// GET /api/projects
function getProjects(req, res) {
  const projects = Project.findAll();
  res.json({ success: true, count: projects.length, data: projects });
}

// GET /api/projects/:id
function getProjectById(req, res) {
  res.json({ success: true, data: findProjectOr404(req.params.id) });
}

// GET /api/projects/:id/tasks
function getProjectTasks(req, res) {
  const project = findProjectOr404(req.params.id);
  const tasks = Task.findAll().filter((t) => t.projectId === project.id);
  res.json({ success: true, project: project.name, count: tasks.length, data: tasks });
}

// POST /api/projects
function createProject(req, res) {
  const project = Project.create({ description: '', ...req.body });
  res.status(201).json({ success: true, message: 'Proje oluşturuldu', data: project });
}

// PATCH /api/projects/:id
function updateProject(req, res) {
  findProjectOr404(req.params.id);
  const project = Project.update(req.params.id, req.body);
  res.json({ success: true, message: 'Proje güncellendi', data: project });
}

// DELETE /api/projects/:id
function deleteProject(req, res) {
  findProjectOr404(req.params.id);

  const linkedTasks = Task.findAll().filter((t) => t.projectId === req.params.id);
  if (linkedTasks.length > 0) {
    throw new ApiError(
      409,
      `Bu projeye bağlı ${linkedTasks.length} görev var. Önce görevleri silin veya başka projeye taşıyın`
    );
  }

  const project = Project.remove(req.params.id);
  res.json({ success: true, message: 'Proje silindi', data: project });
}

module.exports = {
  getProjects,
  getProjectById,
  getProjectTasks,
  createProject,
  updateProject,
  deleteProject,
};

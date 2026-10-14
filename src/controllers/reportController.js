const Task = require('../models/taskModel');

const countBy = (items, key) =>
  items.reduce((acc, item) => {
    const value = item[key] ?? 'atanmamış';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

const isOverdue = (task, today) => task.status !== 'completed' && task.dueDate && task.dueDate < today;

// GET /api/reports/completed
function getCompletedReport(req, res) {
  const completed = Task.findAll().filter((t) => t.status === 'completed');
  res.json({ success: true, data: { completed: completed.length } });
}

// GET /api/reports/pending  → tamamlanmamış (todo + in-progress) görevler
function getPendingReport(req, res) {
  const pending = Task.findAll().filter((t) => t.status !== 'completed');
  res.json({
    success: true,
    data: {
      pending: pending.length,
      byStatus: countBy(pending, 'status'),
      byPriority: countBy(pending, 'priority'),
    },
  });
}

// GET /api/reports/summary
function getSummaryReport(req, res) {
  const tasks = Task.findAll();
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const today = new Date().toISOString().slice(0, 10);

  res.json({
    success: true,
    data: {
      totalTasks: tasks.length,
      completed,
      pending: tasks.length - completed,
      completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
      overdue: tasks.filter((t) => isOverdue(t, today)).length,
      byStatus: countBy(tasks, 'status'),
      byPriority: countBy(tasks, 'priority'),
      byAssignee: countBy(tasks, 'assignee'),
    },
  });
}

module.exports = { getCompletedReport, getPendingReport, getSummaryReport };

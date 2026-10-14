const { STATUSES, PRIORITIES } = require('../models/taskModel');

const taskSchema = {
  title: { type: 'string', required: true, min: 3, max: 100 },
  description: { type: 'string', max: 500 },
  status: { enum: STATUSES },
  priority: { enum: PRIORITIES },
  assignee: { type: 'string', min: 2, max: 50, nullable: true },
  projectId: { type: 'integer', nullable: true },
  dueDate: { type: 'date', nullable: true },
};

const projectSchema = {
  name: { type: 'string', required: true, min: 3, max: 100 },
  description: { type: 'string', max: 500 },
};

module.exports = { taskSchema, projectSchema };

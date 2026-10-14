const createModel = require('./createModel');

const STATUSES = ['todo', 'in-progress', 'completed'];
const PRIORITIES = ['low', 'medium', 'high'];

module.exports = {
  ...createModel('tasks'),
  STATUSES,
  PRIORITIES,
};

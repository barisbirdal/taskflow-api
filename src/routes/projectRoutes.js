const express = require('express');
const controller = require('../controllers/projectController');
const { validateBody, validateId } = require('../middlewares/validate');
const { projectSchema } = require('../validators/schemas');

const router = express.Router();

router
  .route('/')
  .get(controller.getProjects)
  .post(validateBody(projectSchema), controller.createProject);

router.get('/:id/tasks', validateId, controller.getProjectTasks);

router
  .route('/:id')
  .all(validateId)
  .get(controller.getProjectById)
  .patch(validateBody(projectSchema, { partial: true }), controller.updateProject)
  .delete(controller.deleteProject);

module.exports = router;

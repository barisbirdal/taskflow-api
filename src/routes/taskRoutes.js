const express = require('express');
const controller = require('../controllers/taskController');
const { validateBody, validateId } = require('../middlewares/validate');
const { taskSchema } = require('../validators/schemas');

const router = express.Router();

// Not: Sabit yollar (/search, /assignee/:name) dinamik /:id yolundan ÖNCE tanımlanmalıdır.
router.get('/search', controller.searchTasks);
router.get('/assignee/:name', controller.getTasksByAssignee);

router
  .route('/')
  .get(controller.getTasks)
  .post(validateBody(taskSchema), controller.createTask);

router
  .route('/:id')
  .all(validateId)
  .get(controller.getTaskById)
  .put(validateBody(taskSchema), controller.replaceTask)
  .patch(validateBody(taskSchema, { partial: true }), controller.updateTask)
  .delete(controller.deleteTask);

module.exports = router;

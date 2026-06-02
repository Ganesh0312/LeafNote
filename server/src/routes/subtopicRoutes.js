const express = require('express');
const router = express.Router();
const {
  getSubtopicsByTopic,
  getSubtopicById,
  createSubtopic,
  updateSubtopic,
  deleteSubtopic,
} = require('../controllers/subtopicController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');

router.route('/')
  .post(protect, checkPermission('create'), createSubtopic);

router.route('/topic/:topicId')
  .get(getSubtopicsByTopic);

router.route('/:idOrSlug')
  .get(getSubtopicById);

router.route('/:id')
  .put(protect, checkPermission('update'), updateSubtopic)
  .delete(protect, checkPermission('delete'), deleteSubtopic);

module.exports = router;

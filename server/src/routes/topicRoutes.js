const express = require('express');
const router = express.Router();
const {
  getTopicsBySubject,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
} = require('../controllers/topicController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');

router.route('/')
  .post(protect, checkPermission('create'), createTopic);

router.route('/subject/:subjectId')
  .get(getTopicsBySubject);

router.route('/:idOrSlug')
  .get(getTopicById);

router.route('/:id')
  .put(protect, checkPermission('update'), updateTopic)
  .delete(protect, checkPermission('delete'), deleteTopic);

module.exports = router;

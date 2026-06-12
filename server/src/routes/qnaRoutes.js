const express = require('express');
const router = express.Router();
const {
  getQasBySubtopic,
  getQasBySubject,
  getQaById,
  createQa,
  updateQa,
  deleteQa,
} = require('../controllers/qnaController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');

router.route('/')
  .post(protect, checkPermission('create'), createQa);

router.route('/subtopic/:subtopicId')
  .get(getQasBySubtopic);

router.route('/subject/:subjectId')
  .get(getQasBySubject);

router.route('/:id')
  .get(getQaById)
  .put(protect, checkPermission('update'), updateQa)
  .delete(protect, checkPermission('delete'), deleteQa);

module.exports = router;

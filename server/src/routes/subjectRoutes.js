const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubjectBySlug,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');

router.route('/')
  .get(getSubjects)
  .post(protect, checkPermission('create'), createSubject);

router.route('/:id')
  .put(protect, checkPermission('update'), updateSubject)
  .delete(protect, checkPermission('delete'), deleteSubject);

// Slug route
router.route('/slug/:slug')
  .get(getSubjectBySlug);

module.exports = router;

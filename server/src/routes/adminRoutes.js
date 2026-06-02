const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserPermissions } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

// Middleware: only masterAdmin can access any of these routes
const masterAdminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'masterAdmin') {
    return res.status(403).json({ message: 'Access denied. Master Admin only.' });
  }
  next();
};

router.get('/users', protect, masterAdminOnly, getAllUsers);
router.put('/users/:id/permissions', protect, masterAdminOnly, updateUserPermissions);

module.exports = router;

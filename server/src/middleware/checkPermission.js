/**
 * Permission-based access control middleware.
 * Must be used AFTER the `protect` middleware (req.user must exist).
 *
 * Usage: router.post('/', protect, checkPermission('create'), handler)
 */
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // masterAdmin always passes
    if (req.user.role === 'masterAdmin') {
      return next();
    }

    // Check if the user's permissions array contains the required permission
    if (!req.user.permissions || !req.user.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        message: `Access denied. You do not have '${requiredPermission}' permission. Contact the admin to request access.`,
      });
    }

    next();
  };
};

module.exports = { checkPermission };

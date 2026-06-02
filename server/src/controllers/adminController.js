const User = require('../models/User');

// @desc    Get all users (for admin panel)
// @route   GET /api/admin/users
// @access  masterAdmin only
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a user's permissions
// @route   PUT /api/admin/users/:id/permissions
// @access  masterAdmin only
const updateUserPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: 'permissions must be an array' });
    }

    const validPerms = ['read', 'create', 'update', 'delete'];
    const invalid = permissions.filter((p) => !validPerms.includes(p));
    if (invalid.length > 0) {
      return res.status(400).json({ message: `Invalid permissions: ${invalid.join(', ')}` });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cannot modify another masterAdmin
    if (user.role === 'masterAdmin') {
      return res.status(403).json({ message: 'Cannot modify masterAdmin permissions' });
    }

    // Ensure 'read' is always present
    const finalPerms = permissions.includes('read') ? permissions : ['read', ...permissions];
    user.permissions = finalPerms;
    await user.save();

    res.status(200).json({
      message: `Permissions updated for ${user.username}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers, updateUserPermissions };

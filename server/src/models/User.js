const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
    },
    // 'masterAdmin' has full system-wide CRUD, 'user' obeys permissions array
    role: {
      type: String,
      enum: ['user', 'masterAdmin'],
      default: 'user',
    },
    // Granular access control — masterAdmin manages this per user
    permissions: {
      type: [String],
      enum: ['read', 'create', 'update', 'delete'],
      default: ['read'],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Helper method: does this user have a specific permission?
UserSchema.methods.hasPermission = function (permission) {
  if (this.role === 'masterAdmin') return true;
  return this.permissions.includes(permission);
};

module.exports = mongoose.model('User', UserSchema);

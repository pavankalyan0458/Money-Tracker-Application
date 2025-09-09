// --- backend/models/User.js ---
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
});

// 👇 Prevent OverwriteModelError
module.exports = mongoose.models.User || mongoose.model('User', userSchema);

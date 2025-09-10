const express = require('express');
const router = express.Router();
const {
  uploadProfilePhoto,
  removeProfilePhoto,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/userController');

// @route   POST /api/user/upload-photo
// @desc    Upload profile photo
// @access  Private
router.post('/upload-photo', uploadProfilePhoto);

// @route   DELETE /api/user/remove-photo
// @desc    Remove profile photo
// @access  Private
router.delete('/remove-photo', removeProfilePhoto);

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', getUserProfile);

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', updateUserProfile);

module.exports = router;

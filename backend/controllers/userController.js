const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Upload profile photo
// @route   POST /api/user/upload-photo
// @access  Private
const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const { profilePhoto, firebaseUid } = req.body;

  if (!profilePhoto) {
    res.status(400);
    throw new Error('Profile photo is required');
  }

  if (!firebaseUid) {
    res.status(400);
    throw new Error('User ID is required');
  }

  // Validate Base64 format
  const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
  if (!base64Regex.test(profilePhoto)) {
    res.status(400);
    throw new Error('Invalid image format. Please upload a valid image file.');
  }

  // Check file size (Base64 is ~33% larger than original)
  const base64Data = profilePhoto.split(',')[1];
  const fileSizeInBytes = (base64Data.length * 3) / 4;
  const maxSizeInBytes = 1 * 1024 * 1024; // 1MB

  if (fileSizeInBytes > maxSizeInBytes) {
    res.status(400);
    throw new Error('Image size too large. Please upload an image smaller than 1MB.');
  }

  try {
    // Find user by firebaseUid
    const user = await User.findOne({ firebaseUid });
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Update profile photo
    user.profilePhoto = profilePhoto;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      profilePhoto: user.profilePhoto,
    });

  } catch (error) {
    console.error('Profile photo upload error:', error);
    res.status(500);
    throw new Error('Failed to upload profile photo');
  }
});

// @desc    Remove profile photo
// @route   DELETE /api/user/remove-photo
// @access  Private
const removeProfilePhoto = asyncHandler(async (req, res) => {
  const { firebaseUid } = req.body;

  if (!firebaseUid) {
    res.status(400);
    throw new Error('User ID is required');
  }

  try {
    // Find user by firebaseUid
    const user = await User.findOne({ firebaseUid });
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Remove profile photo
    user.profilePhoto = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile photo removed successfully',
    });

  } catch (error) {
    console.error('Profile photo removal error:', error);
    res.status(500);
    throw new Error('Failed to remove profile photo');
  }
});

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const { firebaseUid } = req.query;

  if (!firebaseUid) {
    res.status(400);
    throw new Error('User ID is required');
  }

  try {
    // Find user by firebaseUid
    const user = await User.findOne({ firebaseUid }).select('-password');
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        firebaseUid: user.firebaseUid,
        username: user.username,
        displayName: user.displayName,
        profilePhoto: user.profilePhoto,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500);
    throw new Error('Failed to get user profile');
  }
});

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const { firebaseUid, displayName, username } = req.body;

  if (!firebaseUid) {
    res.status(400);
    throw new Error('User ID is required');
  }

  try {
    // Find user by firebaseUid
    const user = await User.findOne({ firebaseUid });
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Update fields if provided
    if (displayName !== undefined) {
      user.displayName = displayName;
    }
    if (username !== undefined) {
      user.username = username;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        email: user.email,
        firebaseUid: user.firebaseUid,
        username: user.username,
        displayName: user.displayName,
        profilePhoto: user.profilePhoto,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500);
    throw new Error('Failed to update user profile');
  }
});

module.exports = {
  uploadProfilePhoto,
  removeProfilePhoto,
  getUserProfile,
  updateUserProfile,
};

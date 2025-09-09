const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// const sendEmail = require('../utils/sendEmail'); // Commented out as it's no longer used
const admin = require('../config/firebase'); // Your Firebase Admin SDK setup

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret-key', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.status(400);
        throw new Error('Please enter all fields');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        username,
        email,
        password,
    });

    if (user) {
        const welcomeMessage = `
            <h1>Welcome to Money Tracker App!</h1>
            <p>Hello ${user.username},</p>
            <p>Thank you for registering with Money Tracker App. You can now log in and start tracking your finances!</p>
            <br>
            <p>Best regards,</p>
            <p>The Money Tracker Team</p>
        `;

        console.log('Attempting to send welcome email via Firebase...');
        try {
            const sendMailFunction = admin.functions().httpsCallable('sendMail');
            await sendMailFunction({
                to: user.email,
                subject: 'Welcome to Money Tracker App!',
                html: welcomeMessage,
            });
            console.log('Welcome email sending initiated successfully.');
        } catch (error) {
            console.error('Failed to send welcome email via Firebase:', error);
            // Even if email fails, registration is successful.
        }

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
            message: 'Registration successful! Welcome to Money Tracker App.'
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Log incoming request data for debugging
    console.log('\n=== 🔐 LOGIN ATTEMPT ===');
    console.log('📧 Email:', email);
    console.log('🔑 Password provided:', password ? 'Yes' : 'No');
    console.log('📏 Password length:', password ? password.length : 0);
    console.log('⏰ Timestamp:', new Date().toISOString());

    // Validate input
    if (!email || !password) {
        console.log('❌ Login failed: Missing email or password');
        res.status(400);
        throw new Error('Please provide both email and password');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.log('❌ Login failed: Invalid email format');
        res.status(400);
        throw new Error('Please provide a valid email address');
    }

    try {
        // Find user by email and include password field
        console.log('🔍 Searching for user in database...');
        const user = await User.findOne({ email }).select('+password');
        console.log('👤 User found:', user ? 'Yes' : 'No');

        if (user) {
            console.log('📋 User details:');
            console.log('   - ID:', user._id);
            console.log('   - Email:', user.email);
            console.log('   - Username:', user.username);
            console.log('   - Has password field:', user.password ? 'Yes' : 'No');
            console.log('   - Password hash length:', user.password ? user.password.length : 0);
            console.log('   - Password hash starts with $2b$:', user.password ? user.password.startsWith('$2b$') : false);
            console.log('   - Created at:', user.createdAt);
        }

        // Check if user exists
        if (!user) {
            console.log('❌ Login failed: User not found in database');
            res.status(401);
            throw new Error('Invalid credentials');
        }

        // Compare passwords
        console.log('🔐 Attempting password comparison...');
        const isPasswordValid = await user.matchPassword(password);
        console.log('✅ Password comparison result:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('❌ Login failed: Password does not match');
            res.status(401);
            throw new Error('Invalid credentials');
        }

        // Generate JWT token
        console.log('🎫 Generating JWT token...');
        const token = generateToken(user._id);
        console.log('✅ JWT token generated successfully');

        console.log('🎉 Login successful for user:', user.email);

        // Send success response
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: token,
            message: 'Login successful'
        });

    } catch (error) {
        console.error('💥 Login error:', error);

        // Handle specific database errors
        if (error.name === 'MongoError' || error.name === 'MongoServerError') {
            console.error('🗄️ Database error during login:', error.message);
            res.status(500);
            throw new Error('Database error. Please try again later.');
        }

        // Re-throw the error if it's already an HTTP error
        if (res.statusCode !== 200) {
            throw error;
        }

        // Handle unexpected errors
        res.status(500);
        throw new Error('Login failed. Please try again.');
    }
});

// @desc    Forgot password - send reset link to email
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        console.log(`Forgot password request for non-existent email: ${email}. Sending generic success.`);
        res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        return;
    }

    // Ensure user exists before proceeding to generate token
    console.log(`User found for password reset: ${user.email}`);

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false }); // Save token to DB

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const message = `
        <h1>Password Reset Request for Money Tracker App</h1>
        <p>Hello ${user.username},</p>
        <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
        <p>Please click on the following link to reset your password:</p>
        <p><a href="${resetUrl}" clicktracking="off">Reset Password</a></p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <br>
        <p>Best regards,</p>
        <p>The Money Tracker Team</p>
    `;

    console.log(`Attempting to send password reset email to ${user.email}. Reset URL: ${resetUrl}`);
    
    try {
        const sendMailFunction = admin.functions().httpsCallable('sendMail');
        await sendMailFunction({
            to: user.email,
            subject: 'Money Tracker App: Password Reset Request',
            html: message,
        });

        console.log('Password reset email sent successfully via Firebase.');
        res.status(200).json({ message: 'Password reset email sent.' });

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        console.error('Failed to send password reset email via Firebase:', error);
        res.status(500);
        throw new Error('Email could not be sent. Please try again later. (Error details logged)');
    }
});

// @desc    Reset user password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired reset token.');
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private (requires JWT token)
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword,
};

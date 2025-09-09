const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const User = require('../models/User');

router.post('/verify-firebase-token', async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
        return res.status(400).json({ message: 'Firebase ID token is required.' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const firebaseUid = decodedToken.uid;
        const email = decodedToken.email;

        // Find or create the user in your MongoDB
        let user = await User.findOne({ firebaseUid });
        if (!user) {
            user = new User({ email, firebaseUid });
            await user.save();
            console.log('New user created with Firebase UID:', firebaseUid);
        }

        res.status(200).json({
            message: 'Login successful',
            user: {
                _id: user._id,
                email: user.email,
                firebaseUid: user.firebaseUid,
            },
        });
    } catch (error) {
        console.error('Firebase token verification failed on login:', error);
        res.status(401).json({ message: 'Invalid token.' });
    }
});

module.exports = router;

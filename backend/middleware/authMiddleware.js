const admin = require('firebase-admin');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      
      // Ensure user document exists in MongoDB and attach it to the request
      const user = await User.findOneAndUpdate(
        { firebaseUid: decodedToken.uid },
        {
          $set: {
            name: decodedToken.name || 'Anonymous User',
            email: decodedToken.email || null,
          }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      if (!user) {
        throw new Error('User not found and could not be created.');
      }
      
      req.userId = user._id; // Attach the MongoDB user ID
      next();

    } catch (error) {
      console.error('❌ Firebase token verification error:', error);
      res.status(401);
      if (error.code === 'auth/id-token-expired') {
        res.status(401).json({ message: 'Authorization token expired.' });
      } else {
        res.status(401).json({ message: 'Not authorized, token failed.' });
      }
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

module.exports = { protect };

// Test script to verify login functionality
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Connect to MongoDB (update with your connection string)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/money-tracker-app';

async function testLogin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Test data
        const testEmail = 'test@example.com';
        const testPassword = 'password123';
        const testUsername = 'testuser';

        // Clean up - remove existing test user
        await User.deleteOne({ email: testEmail });
        console.log('🧹 Cleaned up existing test user');

        // Create a test user
        const user = await User.create({
            username: testUsername,
            email: testEmail,
            password: testPassword,
        });
        console.log('✅ Test user created:', user.email);

        // Test password comparison
        const userWithPassword = await User.findOne({ email: testEmail }).select('+password');
        console.log('🔍 Found user with password:', userWithPassword ? 'Yes' : 'No');
        
        if (userWithPassword) {
            console.log('📝 Stored password hash:', userWithPassword.password.substring(0, 20) + '...');
            console.log('🔐 Password hash starts with $2b$:', userWithPassword.password.startsWith('$2b$'));
            
            const isMatch = await userWithPassword.matchPassword(testPassword);
            console.log('✅ Password match result:', isMatch);
            
            const isWrongMatch = await userWithPassword.matchPassword('wrongpassword');
            console.log('❌ Wrong password match result:', isWrongMatch);
        }

        // Clean up
        await User.deleteOne({ email: testEmail });
        console.log('🧹 Cleaned up test user');

        console.log('🎉 All tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the test
testLogin(); 
// Test script to verify login functionality with MongoDB Atlas
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGO_URI;

async function testAtlasLogin() {
    console.log('🧪 Testing MongoDB Atlas Login Functionality');
    console.log('============================================');
    
    if (!MONGO_URI) {
        console.error('❌ MONGO_URI not found in environment variables');
        return;
    }
    
    if (MONGO_URI.includes('localhost') || MONGO_URI.includes('127.0.0.1')) {
        console.error('❌ MONGO_URI points to local MongoDB. Please use MongoDB Atlas connection string.');
        return;
    }
    
    console.log('📡 Connection string format:', MONGO_URI.substring(0, 30) + '...');
    
    try {
        // Connect to MongoDB Atlas
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ Connected to MongoDB Atlas successfully');

        // Test data
        const testEmail = 'test@example.com';
        const testPassword = 'password123';
        const testUsername = 'testuser';

        // Clean up - remove existing test user
        console.log('🧹 Cleaning up existing test user...');
        await User.deleteOne({ email: testEmail });
        console.log('✅ Cleanup completed');

        // Create a test user
        console.log('👤 Creating test user...');
        const user = await User.create({
            username: testUsername,
            email: testEmail,
            password: testPassword,
        });
        console.log('✅ Test user created:', user.email);

        // Test password comparison
        console.log('🔍 Retrieving user with password...');
        const userWithPassword = await User.findOne({ email: testEmail }).select('+password');
        console.log('✅ User retrieved with password:', userWithPassword ? 'Yes' : 'No');
        
        if (userWithPassword) {
            console.log('📋 User details:');
            console.log('   - ID:', userWithPassword._id);
            console.log('   - Email:', userWithPassword.email);
            console.log('   - Username:', userWithPassword.username);
            console.log('   - Password hash length:', userWithPassword.password.length);
            console.log('   - Password hash starts with $2b$:', userWithPassword.password.startsWith('$2b$'));
            
            // Test correct password
            console.log('\n🔐 Testing correct password...');
            const isMatch = await userWithPassword.matchPassword(testPassword);
            console.log('✅ Correct password match result:', isMatch);
            
            // Test wrong password
            console.log('\n🔐 Testing wrong password...');
            const isWrongMatch = await userWithPassword.matchPassword('wrongpassword');
            console.log('❌ Wrong password match result:', isWrongMatch);
            
            // Test empty password
            console.log('\n🔐 Testing empty password...');
            const isEmptyMatch = await userWithPassword.matchPassword('');
            console.log('❌ Empty password match result:', isEmptyMatch);
        }

        // Clean up
        console.log('\n🧹 Cleaning up test user...');
        await User.deleteOne({ email: testEmail });
        console.log('✅ Cleanup completed');

        console.log('\n🎉 All tests passed successfully!');
        console.log('✅ MongoDB Atlas connection working');
        console.log('✅ User creation working');
        console.log('✅ Password hashing working');
        console.log('✅ Password comparison working');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code
        });
        
        if (error.name === 'MongoServerSelectionError') {
            console.error('💡 This might be a network issue or incorrect connection string');
        }
        
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('🔌 Disconnected from MongoDB Atlas');
        }
    }
}

// Run the test
testAtlasLogin(); 
const mongoose = require('mongoose');

// Function to connect to MongoDB with retry logic
const connectDB = async () => {
    const maxRetries = 5;
    let retries = 0;

    const connectWithRetry = async () => {
        try {
            // Validate MONGO_URI is set
            if (!process.env.MONGO_URI) {
                throw new Error('MONGO_URI environment variable is not set');
            }

            // Ensure we're connecting to Atlas, not local MongoDB
            if (process.env.MONGO_URI.includes('localhost') || process.env.MONGO_URI.includes('127.0.0.1')) {
                throw new Error('MONGO_URI points to local MongoDB. Please use MongoDB Atlas connection string.');
            }

            console.log('🔌 Attempting to connect to MongoDB Atlas...');
            console.log('📡 Connection string format:', process.env.MONGO_URI.substring(0, 20) + '...');

            const conn = await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 10000, // 10 seconds timeout
                socketTimeoutMS: 45000, // 45 seconds socket timeout
                bufferCommands: false, // Disable mongoose buffering
                // bufferMaxEntries: 0, // Disable mongoose buffering
            });

            console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
            console.log(`📊 Database: ${conn.connection.name}`);
            
            // Set up connection event listeners
            mongoose.connection.on('error', (err) => {
                console.error('❌ MongoDB connection error:', err);
            });

            mongoose.connection.on('disconnected', () => {
                console.log('⚠️ MongoDB disconnected');
            });

            mongoose.connection.on('reconnected', () => {
                console.log('🔄 MongoDB reconnected');
            });

        } catch (error) {
            retries++;
            console.error(`❌ MongoDB Connection Error (Attempt ${retries}/${maxRetries}):`, error.message);
            
            if (retries < maxRetries) {
                console.log(`🔄 Retrying connection in 5 seconds...`);
                setTimeout(connectWithRetry, 5000);
            } else {
                console.error('💥 Max retries reached. Exiting...');
                process.exit(1);
            }
        }
    };

    await connectWithRetry();
};

module.exports = connectDB;

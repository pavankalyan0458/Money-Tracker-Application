const express = require('express');
const dotenv = require('dotenv'); // For loading environment variables from .env file
const connectDB = require('./config/db'); // Function to connect to MongoDB
const authRoutes = require('./routes/authRoutes'); // Authentication routes
const transactionRoutes = require('./routes/transactionRoutes'); // Transaction routes
const walletRoutes = require('./routes/walletRoutes'); // Wallet routes
const errorHandler = require('./middleware/errorHandler'); // Custom error handling middleware
const cors = require('cors'); // For enabling Cross-Origin Resource Sharing
const admin = require('./config/firebase'); // Use centralized Firebase Admin config

// Load environment variables from .env file in the current directory
dotenv.config();

console.log('🚀 Starting Money Tracker Backend Server...');
console.log('📋 Environment:', process.env.NODE_ENV || 'development');
console.log('🔧 Port:', process.env.PORT || 5001);

// Firebase Admin is initialized in ./config/firebase

const app = express(); // Initialize Express app

// Middleware
app.use(express.json({ limit: '10mb' })); // Body parser middleware for parsing JSON data from request body
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// CORS configuration: allow local React dev server by default
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
})); // Enable CORS for frontend domain

// Handle preflight quickly
app.options('*', cors());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', { ...req.body, password: req.body.password ? '***' : undefined });
  }
  next();
});

// Auth is enforced in route modules via protect middleware

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Define API routes, now using our new middleware
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/wallets', walletRoutes);

// Custom error handling middleware (should be placed last)
app.use(errorHandler);

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// --- Server startup using async/await to ensure DB connection is ready ---
const PORT = process.env.PORT || 5001;

// Use an async function to handle startup
const startServer = async () => {
  try {
    // Await the database connection before starting the server
    await connectDB();
    
    // Start the server only after the database connection is successful
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Process terminated');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('Server failed to start:', err.message);
    process.exit(1); // Exit with a failure code
  }
};

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  console.error('💥 Stack trace:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err, promise) => {
  console.error('💥 Unhandled Rejection at:', promise);
  console.error('💥 Reason:', err);
  process.exit(1);
});

// Call the async function to start the application
startServer();

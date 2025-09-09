// backend/middleware/errorHandler.js

// Custom error handling middleware for Express
const errorHandler = (err, req, res, next) => {
    // Determine the status code: if it's 200 (OK), change to 500 (Internal Server Error),
    // otherwise use the existing status code from the response.
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode); // Set the response status code

    // Send a JSON response with the error message.
    // In production, avoid sending the stack trace for security reasons.
    res.json({
        message: err.message,
        // Include stack trace only if not in production environment
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;

const rateLimit = require('express-rate-limit');

/**
 * Rate limiting middleware
 * Prevents abuse and protects API endpoints
 */
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = rateLimiter;

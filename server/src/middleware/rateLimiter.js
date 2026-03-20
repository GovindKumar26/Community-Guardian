import rateLimit from 'express-rate-limit';

// Global rate limiter — applies to all routes
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: {
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth rate limiter — stricter for login/register
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        error: 'Too many authentication attempts',
        message: 'Please try again after 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// API rate limiter — for general API endpoints
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many API requests',
        message: 'Please slow down and try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// AI rate limiter — for Gemini API calls (expensive)
export const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
        error: 'Too many AI requests',
        message: 'AI processing is rate limited. Please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

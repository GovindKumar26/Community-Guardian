import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../schemas/auth.schema.js';

const router = Router();

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validate(registerSchema), async (req, res) => {
    // ─── Honeypot Check (Bot Protection) ──────────────────────────────────────
    // A real human wouldn't have seen nor filled this field.
    if (req.body.confirm_password_real) {
        console.warn(`[Honeypot] Bot registration attempt prevented from IP: ${req.ip}`);
        // Delay response to waste bot resources
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Return a fake success mask
        return res.status(201).json({
            message: 'Account created successfully. Welcome to Community Guardian!',
            token: 'fake-token-for-bot',
            user: { id: 'fake-id', name: req.body.name, email: req.body.email }
        });
    }

    const { name, email, password, selectedArea, preferences } = req.validatedBody;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({
            error: 'Conflict',
            message: 'An account with this email already exists.'
        });
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        selectedArea,
        preferences
    });

    const token = generateToken(user._id);

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
        message: 'Account created successfully. Welcome to Community Guardian!',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            selectedArea: user.selectedArea,
            preferences: user.preferences
        }
    });
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', validate(loginSchema), async (req, res) => {
    const { email, password } = req.validatedBody;

    // Find user with password field and lockout data
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    if (!user) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid email or password.'
        });
    }

    // Check if account is currently locked
    if (user.isLocked) {
        const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
        return res.status(429).json({
            error: 'Too Many Requests',
            message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minute(s).`
        });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        user.loginAttempts += 1;
        
        if (user.loginAttempts >= 5) {
            user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
        }
        await user.save();

        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid email or password.'
        });
    }

    // Login successful — reset lock stats
    if (user.loginAttempts > 0) {
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();
    }

    const token = generateToken(user._id);

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
        message: 'Logged in successfully.',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            selectedArea: user.selectedArea,
            preferences: user.preferences
        }
    });
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', protect, async (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            selectedArea: req.user.selectedArea,
            preferences: req.user.preferences,
            createdAt: req.user.createdAt
        }
    });
});

/**
 * PUT /api/auth/me
 * Update current user profile (area, preferences, name)
 */
router.put('/me', protect, validate(updateProfileSchema), async (req, res) => {
    const updates = req.validatedBody;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true }
    );

    res.json({
        message: 'Profile updated successfully.',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            selectedArea: user.selectedArea,
            preferences: user.preferences
        }
    });
});

/**
 * POST /api/auth/logout
 * Logout user (clear cookie)
 */
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully.' });
});

export default router;

import { z } from 'zod';
import { LOCATIONS, CATEGORIES } from './alert.schema.js';

// Register schema
export const registerSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must not exceed 50 characters')
        .trim(),
    email: z.string()
        .email('Please provide a valid email address')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must not exceed 128 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    selectedArea: z.enum(LOCATIONS, {
        errorMap: () => ({ message: `Please select a valid neighborhood` })
    }),
    preferences: z.array(z.enum(CATEGORIES))
        .min(1, 'Please select at least one alert category')
        .default(['crime', 'scam', 'digital_threat']),
    confirm_password_real: z.string().optional(),
});

// Login schema
export const loginSchema = z.object({
    email: z.string()
        .email('Please provide a valid email address')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(1, 'Password is required'),
});

// Update profile schema
export const updateProfileSchema = z.object({
    name: z.string().min(2).max(50).trim().optional(),
    selectedArea: z.enum(LOCATIONS).optional(),
    preferences: z.array(z.enum(CATEGORIES)).min(1).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
});

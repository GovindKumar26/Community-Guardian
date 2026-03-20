import { z } from 'zod';

// Valid categories for safety alerts
export const CATEGORIES = [
    'crime',
    'scam',
    'digital_threat',
    'hazard',
    'weather',
    'health'
];

// Valid locations (mock neighborhoods)
export const LOCATIONS = [
    'Downtown',
    'Riverside',
    'Oakwood',
    'Hilltop',
    'Lakeview',
    'Greenfield'
];

// Severity levels
export const SEVERITIES = ['low', 'medium', 'high', 'critical'];

// Alert statuses
export const STATUSES = ['active', 'resolved', 'under_review'];

// Create alert schema
export const createAlertSchema = z.object({
    title: z.string()
        .min(5, 'Title must be at least 5 characters')
        .max(200, 'Title must not exceed 200 characters')
        .trim(),
    description: z.string()
        .min(20, 'Description must be at least 20 characters for meaningful reports')
        .max(2000, 'Description must not exceed 2000 characters')
        .trim(),
    category: z.enum(CATEGORIES, {
        errorMap: () => ({ message: `Category must be one of: ${CATEGORIES.join(', ')}` })
    }),
    location: z.enum(LOCATIONS, {
        errorMap: () => ({ message: `Location must be one of: ${LOCATIONS.join(', ')}` })
    }),
    severity: z.enum(SEVERITIES, {
        errorMap: () => ({ message: `Severity must be one of: ${SEVERITIES.join(', ')}` })
    }),
});

// Update alert schema (all fields optional)
export const updateAlertSchema = z.object({
    title: z.string().min(5).max(200).trim().optional(),
    description: z.string().min(20).max(2000).trim().optional(),
    category: z.enum(CATEGORIES).optional(),
    location: z.enum(LOCATIONS).optional(),
    severity: z.enum(SEVERITIES).optional(),
    status: z.enum(STATUSES).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
});

// Query/filter schema
export const alertQuerySchema = z.object({
    category: z.enum(CATEGORIES).optional(),
    location: z.enum(LOCATIONS).optional(),
    severity: z.enum(SEVERITIES).optional(),
    status: z.enum(STATUSES).optional(),
    search: z.string().max(100).optional(),
    verified: z.enum(['true', 'false']).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sort: z.enum(['date', 'severity', 'category']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
}).strict();

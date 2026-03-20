import { z } from 'zod';

// Create circle schema
export const createCircleSchema = z.object({
    name: z.string()
        .min(3, 'Circle name must be at least 3 characters')
        .max(50, 'Circle name must not exceed 50 characters')
        .trim(),
    memberEmails: z.array(
        z.string().email('Each member must have a valid email')
    )
        .min(1, 'Add at least one trusted guardian')
        .max(10, 'A circle can have at most 10 members'),
});

// Send message schema
export const sendMessageSchema = z.object({
    content: z.string()
        .min(1, 'Message cannot be empty')
        .max(500, 'Emergency messages should be concise (max 500 characters)')
        .trim(),
    isEmergency: z.boolean().default(false),
});

// Add member schema
export const addMemberSchema = z.object({
    email: z.string()
        .email('Please provide a valid email address')
        .toLowerCase()
        .trim(),
});

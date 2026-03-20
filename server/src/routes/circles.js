import { Router } from 'express';
import SafeCircle from '../models/SafeCircle.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCircleSchema, sendMessageSchema, addMemberSchema } from '../schemas/circle.schema.js';
import { encrypt, decrypt } from '../lib/encryption.js';

const router = Router();

/**
 * GET /api/circles
 * Get all circles the current user belongs to
 */
router.get('/', protect, async (req, res) => {
    const circles = await SafeCircle.find({ members: req.user._id })
        .populate('members', 'name email')
        .populate('createdBy', 'name')
        .select('-messages') // Don't send messages in list view
        .sort({ updatedAt: -1 })
        .lean();

    res.json({ circles });
});

/**
 * POST /api/circles
 * Create a new Safe Circle
 */
router.post('/', protect, validate(createCircleSchema), async (req, res) => {
    const { name, memberEmails } = req.validatedBody;

    // Find member users by email
    const members = await User.find({ email: { $in: memberEmails } }).select('_id email');
    const foundEmails = members.map(m => m.email);
    const notFound = memberEmails.filter(e => !foundEmails.includes(e));

    if (notFound.length > 0) {
        return res.status(400).json({
            error: 'Validation Error',
            message: `Some members are not registered: ${notFound.join(', ')}`,
            notFoundEmails: notFound
        });
    }

    const memberIds = members.map(m => m._id);

    // Add creator if not already in list
    if (!memberIds.some(id => id.toString() === req.user._id.toString())) {
        memberIds.push(req.user._id);
    }

    const circle = await SafeCircle.create({
        name,
        createdBy: req.user._id,
        members: memberIds
    });

    const populated = await SafeCircle.findById(circle._id)
        .populate('members', 'name email')
        .populate('createdBy', 'name')
        .lean();

    res.status(201).json({
        message: 'Safe Circle created. Your trusted guardians have been added.',
        circle: populated
    });
});

/**
 * GET /api/circles/:id
 * Get circle detail with decrypted messages
 * Only members can view
 */
router.get('/:id', protect, async (req, res) => {
    const circle = await SafeCircle.findById(req.params.id)
        .populate('members', 'name email')
        .populate('createdBy', 'name')
        .populate('messages.sender', 'name');

    if (!circle) {
        return res.status(404).json({
            error: 'Not Found',
            message: 'Safe Circle not found.'
        });
    }

    // Check membership
    const isMember = circle.members.some(
        m => m._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'You are not a member of this Safe Circle.'
        });
    }

    // Decrypt messages for members
    const decryptedMessages = circle.messages.map(msg => {
        try {
            return {
                _id: msg._id,
                sender: msg.sender,
                content: decrypt(msg.encryptedContent, msg.iv),
                isEmergency: msg.isEmergency,
                createdAt: msg.createdAt
            };
        } catch {
            return {
                _id: msg._id,
                sender: msg.sender,
                content: '[Message could not be decrypted]',
                isEmergency: msg.isEmergency,
                createdAt: msg.createdAt
            };
        }
    });

    res.json({
        circle: {
            _id: circle._id,
            name: circle.name,
            createdBy: circle.createdBy,
            members: circle.members,
            messages: decryptedMessages,
            createdAt: circle.createdAt,
            updatedAt: circle.updatedAt
        }
    });
});

/**
 * POST /api/circles/:id/messages
 * Send an encrypted message to the circle
 * Only members can send
 */
router.post('/:id/messages', protect, validate(sendMessageSchema), async (req, res) => {
    const circle = await SafeCircle.findById(req.params.id);

    if (!circle) {
        return res.status(404).json({
            error: 'Not Found',
            message: 'Safe Circle not found.'
        });
    }

    // Check membership
    const isMember = circle.members.some(
        m => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'You are not a member of this Safe Circle.'
        });
    }

    const { content, isEmergency } = req.validatedBody;

    // Encrypt the message
    const { encryptedContent, iv } = encrypt(content);

    circle.messages.push({
        sender: req.user._id,
        content: '[encrypted]', // Placeholder — actual content is encrypted
        encryptedContent,
        iv,
        isEmergency
    });

    await circle.save();

    res.status(201).json({
        message: isEmergency
            ? 'Emergency alert sent to your circle.'
            : 'Message sent to your circle.',
        sentMessage: {
            content, // Return plaintext to sender
            isEmergency,
            sender: { _id: req.user._id, name: req.user.name },
            createdAt: new Date()
        }
    });
});

/**
 * POST /api/circles/:id/members
 * Add a member to the circle (only creator can add)
 */
router.post('/:id/members', protect, validate(addMemberSchema), async (req, res) => {
    const circle = await SafeCircle.findById(req.params.id);

    if (!circle) {
        return res.status(404).json({
            error: 'Not Found',
            message: 'Safe Circle not found.'
        });
    }

    // Only creator can add members
    if (circle.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Only the circle creator can add members.'
        });
    }

    // Max 10 members
    if (circle.members.length >= 10) {
        return res.status(400).json({
            error: 'Limit Reached',
            message: 'A Safe Circle can have at most 10 members.'
        });
    }

    const { email } = req.validatedBody;
    const newMember = await User.findOne({ email });

    if (!newMember) {
        return res.status(404).json({
            error: 'Not Found',
            message: 'No user found with this email address.'
        });
    }

    // Check if already a member
    if (circle.members.some(m => m.toString() === newMember._id.toString())) {
        return res.status(409).json({
            error: 'Conflict',
            message: 'This user is already a member of the circle.'
        });
    }

    circle.members.push(newMember._id);
    await circle.save();

    res.json({
        message: `${newMember.name} has been added to the circle.`,
        member: { id: newMember._id, name: newMember.name, email: newMember.email }
    });
});

export default router;

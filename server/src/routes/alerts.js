import { Router } from 'express';
import Alert from '../models/Alert.js';
import { validate } from '../middleware/validate.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { createAlertSchema, updateAlertSchema, alertQuerySchema } from '../schemas/alert.schema.js';
import { categorizeAlert, generateChecklist, summarizeAlert } from '../lib/ai.js';

const router = Router();

/**
 * GET /api/alerts
 * List alerts with filtering, search, pagination, and sorting
 * Public route (optionalAuth to personalize if logged in)
 */
router.get('/', optionalAuth, validate(alertQuerySchema, 'query'), async (req, res) => {
    const {
        category, location, severity, status, search, verified,
        page = 1, limit = 20, sort = 'date', order = 'desc'
    } = req.validatedQuery || req.query;

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (location) filter.location = location;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (verified !== undefined) filter.verified = verified === 'true';

    // Text search
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    // Sort config
    const sortConfig = {};
    if (sort === 'severity') {
        // Custom severity ordering
        sortConfig.severity = order === 'asc' ? 1 : -1;
    } else if (sort === 'category') {
        sortConfig.category = order === 'asc' ? 1 : -1;
    } else {
        sortConfig.date = order === 'asc' ? 1 : -1;
    }

    const skip = (page - 1) * Math.min(limit, 50);
    const boundedLimit = Math.min(limit, 50);

    const [alerts, total] = await Promise.all([
        Alert.find(filter)
            .sort(sortConfig)
            .skip(skip)
            .limit(boundedLimit)
            .populate('submittedBy', 'name')
            .lean(),
        Alert.countDocuments(filter)
    ]);

    res.json({
        alerts,
        pagination: {
            page,
            limit: boundedLimit,
            total,
            pages: Math.ceil(total / boundedLimit)
        }
    });
});

/**
 * GET /api/alerts/:id
 * Get single alert by ID
 */
router.get('/:id', optionalAuth, async (req, res) => {
    const alert = await Alert.findById(req.params.id)
        .populate('submittedBy', 'name')
        .lean();

    if (!alert) {
        return res.status(404).json({
            error: 'Not Found',
            message: 'Alert not found.'
        });
    }

    res.json({ alert });
});

/**
 * POST /api/alerts
 * Create a new alert (requires auth)
 * AI categorizes, summarizes, and generates actionable checklist
 */
router.post('/', protect, validate(createAlertSchema), async (req, res) => {
    const { title, description, category, location, severity } = req.validatedBody;

    // Run AI processing in parallel
    const [aiCategorization, aiChecklist, aiSummary] = await Promise.all([
        categorizeAlert(title, description),
        generateChecklist(title, description, category),
        summarizeAlert(title, description, category)
    ]);

    const alert = await Alert.create({
        title,
        description,
        category: aiCategorization.source === 'ai' ? aiCategorization.category : category,
        subcategory: aiCategorization.subcategory,
        severity,
        location,
        source: 'community',
        verified: false,
        status: aiCategorization.scamScore > 0.7 ? 'under_review' : 'active',
        submittedBy: req.user._id,
        aiSummary: aiSummary.summary,
        aiCategory: aiCategorization.category,
        actionableSteps: aiChecklist.steps,
        aiSource: aiCategorization.source,
        scamScore: aiCategorization.scamScore || 0,
        scamJustification: aiCategorization.scamJustification || null
    });

    const populated = await Alert.findById(alert._id)
        .populate('submittedBy', 'name')
        .lean();

    res.status(201).json({
        message: 'Alert submitted successfully. Here are your recommended actions.',
        alert: populated,
        actionableReport: {
            steps: aiChecklist.steps,
            source: aiChecklist.source,
            summary: aiSummary.summary,
            categorization: {
                category: aiCategorization.category,
                subcategory: aiCategorization.subcategory,
                confidence: aiCategorization.confidence,
                source: aiCategorization.source
            }
        }
    });
});

/**
 * PUT /api/alerts/:id
 * Update an alert (status, severity, etc.)
 */
router.put('/:id', protect, validate(updateAlertSchema), async (req, res) => {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
        return res.status(404).json({
            error: 'Not Found',
            message: 'Alert not found.'
        });
    }

    // Only creator or system alerts can be updated
    if (alert.source === 'community' && alert.submittedBy?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'You can only update your own alerts.'
        });
    }

    const updates = req.validatedBody;
    Object.assign(alert, updates);
    await alert.save();

    const updated = await Alert.findById(alert._id)
        .populate('submittedBy', 'name')
        .lean();

    res.json({
        message: 'Alert updated successfully.',
        alert: updated
    });
});

/**
 * GET /api/alerts/stats/overview
 * Get alert statistics for the dashboard
 */
router.get('/stats/overview', optionalAuth, async (req, res) => {
    const location = req.query.location || req.user?.selectedArea;

    const filter = {};
    if (location) filter.location = location;

    const [
        total,
        active,
        resolved,
        critical,
        byCategory,
        bySeverity
    ] = await Promise.all([
        Alert.countDocuments(filter),
        Alert.countDocuments({ ...filter, status: 'active' }),
        Alert.countDocuments({ ...filter, status: 'resolved' }),
        Alert.countDocuments({ ...filter, severity: 'critical', status: 'active' }),
        Alert.aggregate([
            { $match: filter },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]),
        Alert.aggregate([
            { $match: filter },
            { $group: { _id: '$severity', count: { $sum: 1 } } }
        ])
    ]);

    res.json({
        stats: {
            total,
            active,
            resolved,
            critical,
            byCategory: Object.fromEntries(byCategory.map(b => [b._id, b.count])),
            bySeverity: Object.fromEntries(bySeverity.map(b => [b._id, b.count])),
            location: location || 'all'
        }
    });
});

/**
 * POST /api/alerts/:id/verify
 * Vouch for an alert — confirms it's real
 * Toggle: clicking again removes your verification
 */
router.post('/:id/verify', protect, async (req, res) => {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
        return res.status(404).json({ error: 'Not Found', message: 'Alert not found.' });
    }

    const userId = req.user._id.toString();
    const alreadyVerified = alert.verifiedBy.some(id => id.toString() === userId);
    const alreadyFlagged = alert.flaggedBy.some(id => id.toString() === userId);

    if (alreadyVerified) {
        // Toggle off
        alert.verifiedBy = alert.verifiedBy.filter(id => id.toString() !== userId);
    } else {
        // Remove flag if exists (can't do both)
        if (alreadyFlagged) {
            alert.flaggedBy = alert.flaggedBy.filter(id => id.toString() !== userId);
        }
        alert.verifiedBy.push(req.user._id);
    }

    // Auto-verify when 3+ community members vouch
    if (alert.verifiedBy.length >= 3 && !alert.verified) {
        alert.verified = true;
    }

    await alert.save();

    res.json({
        message: alreadyVerified ? 'Verification removed.' : 'Alert verified.',
        verifyCount: alert.verifiedBy.length,
        flagCount: alert.flaggedBy.length,
        verified: alert.verified,
        userVerified: !alreadyVerified,
        userFlagged: false
    });
});

/**
 * POST /api/alerts/:id/flag
 * Flag an alert — marks it as possibly inaccurate or resolved
 * Toggle: clicking again removes your flag
 */
router.post('/:id/flag', protect, async (req, res) => {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
        return res.status(404).json({ error: 'Not Found', message: 'Alert not found.' });
    }

    const userId = req.user._id.toString();
    const alreadyFlagged = alert.flaggedBy.some(id => id.toString() === userId);
    const alreadyVerified = alert.verifiedBy.some(id => id.toString() === userId);

    if (alreadyFlagged) {
        // Toggle off
        alert.flaggedBy = alert.flaggedBy.filter(id => id.toString() !== userId);
    } else {
        // Remove verify if exists (can't do both)
        if (alreadyVerified) {
            alert.verifiedBy = alert.verifiedBy.filter(id => id.toString() !== userId);
        }
        alert.flaggedBy.push(req.user._id);
    }

    // Auto-mark for review when 3+ flags
    if (alert.flaggedBy.length >= 3 && alert.status === 'active') {
        alert.status = 'under_review';
    }

    await alert.save();

    res.json({
        message: alreadyFlagged ? 'Flag removed.' : 'Alert flagged for review.',
        verifyCount: alert.verifiedBy.length,
        flagCount: alert.flaggedBy.length,
        verified: alert.verified,
        userVerified: false,
        userFlagged: !alreadyFlagged
    });
});

export default router;

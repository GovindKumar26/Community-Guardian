import { Router } from 'express';
import Alert from '../models/Alert.js';
import { protect } from '../middleware/auth.js';
import { generateDigest } from '../lib/ai.js';

const router = Router();

/**
 * POST /api/digest
 * Generate an AI-powered safety digest for the user's area and preferences
 * Personalized based on user's selectedArea and preference categories
 */
router.post('/', protect, async (req, res) => {
    const { selectedArea, preferences } = req.user;

    // Fetch active alerts for user's area
    const filter = {
        status: 'active',
        location: selectedArea
    };

    // Optionally filter by user's preferred categories
    if (preferences && preferences.length > 0) {
        filter.category = { $in: preferences };
    }

    const alerts = await Alert.find(filter)
        .sort({ severity: -1, date: -1 })
        .limit(20)
        .lean();

    // Generate AI digest
    const result = await generateDigest(alerts, selectedArea, preferences);

    res.json({
        digest: result.digest,
        source: result.source,
        meta: {
            location: selectedArea,
            preferences,
            alertCount: alerts.length,
            generatedAt: new Date().toISOString()
        }
    });
});

export default router;

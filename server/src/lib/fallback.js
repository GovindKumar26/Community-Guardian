/**
 * Rule-Based Fallback for AI
 * Used when Gemini API is unavailable or returns errors.
 * Provides keyword-based categorization and pre-built checklist templates.
 */

// Keyword maps for categorization
const CATEGORY_KEYWORDS = {
    digital_threat: [
        'phishing', 'malware', 'ransomware', 'hack', 'breach', 'data leak',
        'suspicious email', 'virus', 'trojan', 'spyware', 'ddos', 'cyber',
        'password', 'account compromise', 'two-factor', '2fa', 'identity theft',
        'dark web', 'vpn', 'firewall', 'encryption', 'ssl', 'certificate'
    ],
    scam: [
        'scam', 'fraud', 'fake', 'impersonat', 'ponzi', 'lottery',
        'prize', 'inheritance', 'nigerian', 'advance fee', 'romance scam',
        'tech support scam', 'irs scam', 'tax scam', 'gift card',
        'wire transfer', 'money mule', 'pyramid scheme', 'too good to be true',
        'unsolicited call', 'door-to-door', 'pressure to pay'
    ],
    crime: [
        'robbery', 'theft', 'burglary', 'assault', 'vandalism', 'break-in',
        'stolen', 'suspicious person', 'suspicious activity', 'trespassing',
        'mugging', 'carjacking', 'shooting', 'weapon', 'knife', 'gun',
        'home invasion', 'package theft', 'shoplifting'
    ],
    hazard: [
        'road', 'construction', 'pothole', 'fallen tree', 'power line',
        'gas leak', 'chemical spill', 'fire', 'explosion', 'structural damage',
        'unsafe building', 'electrical', 'water main', 'sinkhole', 'bridge',
        'traffic accident', 'blocked road'
    ],
    weather: [
        'storm', 'flood', 'hurricane', 'tornado', 'earthquake', 'lightning',
        'hail', 'blizzard', 'ice', 'heat wave', 'cold snap', 'wildfire',
        'tsunami', 'landslide', 'fog', 'wind', 'weather warning'
    ],
    health: [
        'outbreak', 'contamination', 'food safety', 'water quality', 'air quality',
        'epidemic', 'pandemic', 'vaccination', 'hospital', 'medical', 'toxic',
        'allergen', 'recall', 'health advisory', 'bug infestation', 'mold'
    ]
};

// Pre-built checklist templates per category
const CHECKLIST_TEMPLATES = {
    digital_threat: [
        'Change your passwords immediately for any affected accounts',
        'Enable two-factor authentication (2FA) on all important accounts',
        'Check your accounts for any unauthorized activity',
        'Run a full antivirus scan on your devices',
        'Monitor your bank statements for suspicious transactions',
        'Report the incident to your email provider or relevant platform',
        'Do not click on any suspicious links or download attachments'
    ],
    scam: [
        'Do not send any money or share personal information',
        'Block the phone number or email address of the scammer',
        'Report the scam to local authorities and the FTC',
        'Warn family and friends about the scam',
        'If you shared financial info, contact your bank immediately',
        'Document everything — save messages, emails, and call logs'
    ],
    crime: [
        'If in immediate danger, call emergency services (911)',
        'Do not confront the suspect — stay safe',
        'Document what you saw — note descriptions, times, and locations',
        'Report the incident to local police',
        'Check and secure your doors, windows, and entry points',
        'Alert your neighbors through Community Guardian'
    ],
    hazard: [
        'Stay away from the affected area',
        'Report the hazard to local authorities or public works',
        'Warn others in the area — share this alert',
        'Follow any official detour or safety instructions',
        'Take photos or document the hazard if safe to do so',
        'Check for updates from local emergency management'
    ],
    weather: [
        'Stay indoors and monitor official weather updates',
        'Prepare an emergency kit (water, flashlight, medications)',
        'Charge your phone and portable devices',
        'Secure outdoor furniture and loose objects',
        'Know your evacuation routes if severe weather is expected',
        'Check on elderly neighbors or vulnerable community members'
    ],
    health: [
        'Follow instructions from local health authorities',
        'Avoid the affected area or contaminated products',
        'Seek medical attention if you experience symptoms',
        'Wash hands frequently and maintain hygiene',
        'Check official sources for recalls or advisories',
        'Share this alert with family and neighbors'
    ]
};

// Summary templates per category
const SUMMARY_TEMPLATES = {
    digital_threat: 'A digital security concern has been reported in your area. Take steps to protect your online accounts and devices.',
    scam: 'A potential scam has been identified in your area. Stay vigilant and do not share personal or financial information.',
    crime: 'A safety incident has been reported in your area. Stay aware of your surroundings and report any related activity.',
    hazard: 'A physical hazard has been reported in your area. Avoid the affected area and follow safety guidelines.',
    weather: 'A weather-related advisory has been issued for your area. Prepare accordingly and stay safe.',
    health: 'A health advisory has been issued for your area. Follow recommended precautions.'
};

/**
 * Categorize text using keyword matching
 * @param {string} text - The text to categorize
 * @returns {{ category: string, subcategory: string|null, confidence: number, source: string }}
 */
export function fallbackCategorize(text) {
    const lowerText = text.toLowerCase();
    let bestCategory = 'hazard'; // default
    let bestScore = 0;
    let matchedKeyword = null;

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        let score = 0;
        let lastMatch = null;

        for (const keyword of keywords) {
            if (lowerText.includes(keyword)) {
                score++;
                lastMatch = keyword;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestCategory = category;
            matchedKeyword = lastMatch;
        }
    }

    return {
        category: bestCategory,
        subcategory: matchedKeyword,
        confidence: bestScore > 3 ? 0.8 : bestScore > 1 ? 0.6 : 0.4,
        source: 'rule-based'
    };
}

/**
 * Generate actionable checklist from templates
 * @param {string} category - The alert category
 * @returns {{ steps: string[], source: string }}
 */
export function fallbackChecklist(category) {
    const steps = CHECKLIST_TEMPLATES[category] || CHECKLIST_TEMPLATES.hazard;
    return {
        steps,
        source: 'rule-based'
    };
}

/**
 * Generate a summary from templates
 * @param {string} category - The alert category
 * @param {string} title - The alert title
 * @returns {{ summary: string, source: string }}
 */
export function fallbackSummarize(category, title) {
    const template = SUMMARY_TEMPLATES[category] || SUMMARY_TEMPLATES.hazard;
    return {
        summary: `${title}. ${template}`,
        source: 'rule-based'
    };
}

/**
 * Generate a digest summary from multiple alerts (fallback)
 * Groups alerts by category and creates a structured summary
 * @param {Array} alerts - Array of alert objects
 * @param {string} location - User's selected area
 * @returns {{ digest: string, source: string }}
 */
export function fallbackDigest(alerts, location) {
    if (!alerts || alerts.length === 0) {
        return {
            digest: `All clear in ${location}! No active alerts at this time. Stay safe and vigilant.`,
            source: 'rule-based'
        };
    }

    const grouped = {};
    for (const alert of alerts) {
        if (!grouped[alert.category]) grouped[alert.category] = [];
        grouped[alert.category].push(alert);
    }

    const categoryLabels = {
        crime: 'Crime & Safety',
        scam: 'Scam Alerts',
        digital_threat: 'Digital Security',
        hazard: 'Hazards',
        weather: 'Weather',
        health: 'Health'
    };

    let digest = `Safety Digest for ${location}\n\n`;
    digest += `${alerts.length} active alert(s) in your area.\n\n`;

    for (const [category, categoryAlerts] of Object.entries(grouped)) {
        const label = categoryLabels[category] || category;
        digest += `${label} (${categoryAlerts.length}):\n`;
        for (const alert of categoryAlerts.slice(0, 3)) {
            const severityIcon = alert.severity === 'critical' ? '[CRITICAL]' :
                alert.severity === 'high' ? '[HIGH]' :
                    alert.severity === 'medium' ? '[MEDIUM]' : '[LOW]';
            digest += `  ${severityIcon} ${alert.title}\n`;
        }
        if (categoryAlerts.length > 3) {
            digest += `  ... and ${categoryAlerts.length - 3} more\n`;
        }
        digest += '\n';
    }

    digest += 'Stay informed and take action where needed. You\'re in control.';

    return {
        digest,
        source: 'rule-based'
    };
}

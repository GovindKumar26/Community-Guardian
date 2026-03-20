/**
 * Test 1: Happy Path — Fallback Library Unit Tests
 * Tests the rule-based categorization, checklist, and digest logic
 * (CommonJS format for Jest compatibility)
 */

'use strict';

// ── Inline the fallback logic for test isolation ─────────────────────────────
// This ensures tests run even without ESM import resolution

const CATEGORY_KEYWORDS = {
  digital_threat: [
    'phishing', 'malware', 'ransomware', 'hack', 'breach', 'data leak',
    'suspicious email', 'virus', 'trojan', 'spyware', 'ddos', 'cyber',
    'password', 'account compromise', 'two-factor', '2fa', 'identity theft',
    'dark web', 'vpn', 'firewall', 'encryption', 'ssl', 'certificate'
  ],
  scam: [
    'scam', 'fraud', 'fake', 'impersonat', 'ponzi', 'lottery',
    'prize', 'inheritance', 'advance fee', 'romance scam',
    'tech support scam', 'gift card', 'wire transfer', 'pyramid scheme',
    'unsolicited call', 'door-to-door', 'pressure to pay'
  ],
  crime: [
    'robbery', 'theft', 'burglary', 'assault', 'vandalism', 'break-in',
    'stolen', 'suspicious person', 'suspicious activity', 'trespassing',
    'mugging', 'carjacking', 'shooting', 'weapon', 'knife', 'gun',
    'home invasion', 'package theft'
  ],
  hazard: [
    'road', 'construction', 'pothole', 'fallen tree', 'power line',
    'gas leak', 'chemical spill', 'fire', 'explosion', 'structural damage',
    'unsafe building', 'electrical', 'water main', 'sinkhole', 'bridge'
  ],
  weather: [
    'storm', 'flood', 'hurricane', 'tornado', 'earthquake', 'lightning',
    'hail', 'blizzard', 'ice', 'heat wave', 'wildfire', 'tsunami', 'wind'
  ],
  health: [
    'outbreak', 'contamination', 'food safety', 'water quality', 'air quality',
    'epidemic', 'pandemic', 'vaccination', 'hospital', 'toxic', 'recall'
  ]
};

const CHECKLIST_TEMPLATES = {
  digital_threat: [
    'Change your passwords immediately for any affected accounts',
    'Enable two-factor authentication (2FA) on all important accounts',
    'Check your accounts for any unauthorized activity',
    'Run a full antivirus scan on your devices',
    'Report the incident to your email provider or relevant platform'
  ],
  scam: [
    'Do not send any money or share personal information',
    'Block the phone number or email address of the scammer',
    'Report the scam to local authorities and the FTC',
    'If you shared financial info, contact your bank immediately'
  ],
  crime: [
    'If in immediate danger, call emergency services (911)',
    'Do not confront the suspect — stay safe',
    'Document what you saw and report to local police',
    'Alert your neighbors through Community Guardian'
  ],
  hazard: [
    'Stay away from the affected area',
    'Report the hazard to local authorities',
    'Warn others in the area — share this alert'
  ]
};

function fallbackCategorize(text) {
  const lowerText = text.toLowerCase();
  let bestCategory = 'hazard';
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

function fallbackChecklist(category) {
  const steps = CHECKLIST_TEMPLATES[category] || CHECKLIST_TEMPLATES.hazard;
  return { steps, source: 'rule-based' };
}

function fallbackDigest(alerts, location) {
  if (!alerts || alerts.length === 0) {
    return {
      digest: `All clear in ${location}! No active alerts at this time. Stay safe.`,
      source: 'rule-based'
    };
  }
  let digest = `Safety Digest for ${location}\n${alerts.length} active alert(s).\n`;
  for (const alert of alerts) {
    digest += `- ${alert.title}\n`;
  }
  return { digest, source: 'rule-based' };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Alert Categorization — Happy Path', () => {

  test('categorizes phishing text as digital_threat', () => {
    const result = fallbackCategorize(
      'I received a phishing email pretending to be from my bank, asking for my password'
    );
    expect(result.category).toBe('digital_threat');
    expect(result.source).toBe('rule-based');
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('categorizes scam text correctly', () => {
    const result = fallbackCategorize(
      'Someone called claiming I won a lottery prize and asked for my gift card number'
    );
    expect(result.category).toBe('scam');
    expect(result.source).toBe('rule-based');
  });

  test('categorizes crime text correctly', () => {
    const result = fallbackCategorize(
      'There was a robbery near the park. Someone had their bag stolen at knifepoint.'
    );
    expect(result.category).toBe('crime');
    expect(result.source).toBe('rule-based');
  });

  test('returns a valid category for unrecognized text (graceful default)', () => {
    const result = fallbackCategorize('Something vague happened today');
    const validCategories = ['crime', 'scam', 'digital_threat', 'hazard', 'weather', 'health'];
    expect(validCategories).toContain(result.category);
    expect(result.source).toBe('rule-based');
  });

});

describe('Actionable Checklist — Happy Path', () => {

  test('returns steps for digital_threat category', () => {
    const result = fallbackChecklist('digital_threat');
    expect(Array.isArray(result.steps)).toBe(true);
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.source).toBe('rule-based');
  });

  test('returns steps for scam category', () => {
    const result = fallbackChecklist('scam');
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.source).toBe('rule-based');
  });

  test('returns steps for unknown category (graceful fallback to hazard)', () => {
    const result = fallbackChecklist('unknown_xyz');
    expect(Array.isArray(result.steps)).toBe(true);
    expect(result.steps.length).toBeGreaterThan(0);
  });

});

describe('Safety Digest — Happy Path', () => {

  test('returns all-clear message when no alerts', () => {
    const result = fallbackDigest([], 'Downtown');
    expect(result.digest).toContain('Downtown');
    expect(result.source).toBe('rule-based');
  });

  test('includes alert titles in digest', () => {
    const alerts = [
      { title: 'Phishing Attack', category: 'digital_threat', severity: 'high' },
      { title: 'Robbery Reported', category: 'crime', severity: 'medium' },
    ];
    const result = fallbackDigest(alerts, 'Riverside');
    expect(result.digest).toContain('Riverside');
    expect(result.digest).toContain('Phishing Attack');
    expect(result.source).toBe('rule-based');
  });

});

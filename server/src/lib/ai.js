import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    fallbackCategorize,
    fallbackChecklist,
    fallbackSummarize,
    fallbackDigest
} from './fallback.js';

let genAI = null;
let model = null;

/**
 * Initialize Gemini AI client
 * Lazy initialization — only connects when first called
 */
function getModel() {
    if (!model) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('GEMINI_API_KEY not set. AI features will use rule-based fallback');
            return null;
        }
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
    return model;
}

/**
 * Categorize an alert using Gemini AI
 * Falls back to keyword-based categorization on failure
 */
export async function categorizeAlert(title, description) {
    try {
        const ai = getModel();
        if (!ai) return fallbackCategorize(`${title} ${description}`);

        const prompt = `You are a community safety AI assistant. Analyze the following incident report for two things:
1. Categorize it into exactly ONE category and provide a subcategory.
2. Evaluate if the report sounds like a scam or malicious "phishing" attempt (e.g., asking for money, urgent links to unofficial sites, impersonating banks/police, or promising rewards).

Categories: crime, scam, digital_threat, hazard, weather, health

Incident Title: ${title}
Description: ${description}

Respond ONLY in this exact JSON format, no other text:
{
  "category": "...", 
  "subcategory": "...", 
  "confidence": 0.0,
  "scamScore": 0.0, 
  "scamJustification": "..."
}

Respond with "scamScore" between 0 and 1, where 1 is a certain scam. 
Provide a brief "scamJustification" if the score is above 0.3.`;

        const result = await ai.generateContent(prompt);
        const text = result.response.text().trim();

        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI response was not valid JSON');

        const parsed = JSON.parse(jsonMatch[0]);

        // Validate the category
        const validCategories = ['crime', 'scam', 'digital_threat', 'hazard', 'weather', 'health'];
        const category = validCategories.includes(parsed.category) ? parsed.category : 'crime';

        return {
            category,
            subcategory: parsed.subcategory || null,
            confidence: parsed.confidence || 0.7,
            scamScore: parsed.scamScore || 0,
            scamJustification: parsed.scamJustification || null,
            source: 'ai'
        };
    } catch (error) {
        console.error('AI categorization failed, using fallback:', error.message);
        return {
            ...fallbackCategorize(`${title} ${description}`),
            scamScore: 0,
            scamJustification: null
        };
    }
}

/**
 * Generate actionable checklist for an incident using Gemini AI
 * Falls back to template checklists on failure
 */
export async function generateChecklist(title, description, category) {
    try {
        const ai = getModel();
        if (!ai) return fallbackChecklist(category);

        const prompt = `You are a community safety expert providing calm, empowering advice. Given this safety incident, provide 4-6 clear, actionable steps a person should take.

Use empowering language — make the reader feel in control, not anxious.
Be specific and practical.

Category: ${category}
Incident: ${title}
Details: ${description}

Respond ONLY as a JSON array of strings, no other text:
["Step 1...", "Step 2...", ...]`;

        const result = await ai.generateContent(prompt);
        const text = result.response.text().trim();

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('AI response was not a valid array');

        const steps = JSON.parse(jsonMatch[0]);

        if (!Array.isArray(steps) || steps.length === 0) {
            throw new Error('AI returned empty or invalid steps');
        }

        return {
            steps: steps.slice(0, 7), // Cap at 7 steps
            source: 'ai'
        };
    } catch (error) {
        console.error('AI checklist generation failed, using fallback:', error.message);
        return fallbackChecklist(category);
    }
}

/**
 * Summarize an individual alert using Gemini AI
 * Falls back to template summaries on failure
 */
export async function summarizeAlert(title, description, category) {
    try {
        const ai = getModel();
        if (!ai) return fallbackSummarize(category, title);

        const prompt = `You are a community safety AI that creates calm, non-alarmist summaries. Summarize this incident in 1-2 clear sentences that feel empowering, not anxiety-inducing.

Title: ${title}
Description: ${description}
Category: ${category}

Respond with ONLY the summary text, nothing else.`;

        const result = await ai.generateContent(prompt);
        const summary = result.response.text().trim();

        if (!summary || summary.length < 10) {
            throw new Error('AI returned empty summary');
        }

        return {
            summary,
            source: 'ai'
        };
    } catch (error) {
        console.error('AI summarization failed, using fallback:', error.message);
        return fallbackSummarize(category, title);
    }
}

/**
 * Generate a safety digest from multiple alerts using Gemini AI
 * Falls back to grouped template digest on failure
 */
export async function generateDigest(alerts, location, preferences) {
    try {
        const ai = getModel();
        if (!ai) return fallbackDigest(alerts, location);

        if (!alerts || alerts.length === 0) {
            return {
                digest: `All clear in ${location}! No active alerts at this time. Stay safe and keep an eye on your Community Guardian dashboard.`,
                source: 'ai'
            };
        }

        const alertSummaries = alerts.slice(0, 15).map(a =>
            `[${a.severity.toUpperCase()}] [${a.category}] ${a.title}: ${a.description?.substring(0, 100)}...`
        ).join('\n');

        const prompt = `You are Community Guardian, a calm and empowering safety assistant. Create a safety digest for a resident of ${location}.

Their alert preferences: ${preferences?.join(', ') || 'all categories'}

Active alerts:
${alertSummaries}

Create a digest that is:
1. Calm and empowering — never alarmist or anxiety-inducing
2. Organized by priority (critical first)
3. Each alert gets a brief 1-line summary
4. End with a reassuring note

Do NOT use emojis. Use clean, readable text.
Format as clean, readable text (not JSON).`;

        const result = await ai.generateContent(prompt);
        const digest = result.response.text().trim();

        if (!digest || digest.length < 20) {
            throw new Error('AI returned empty digest');
        }

        return {
            digest,
            source: 'ai'
        };
    } catch (error) {
        console.error('AI digest generation failed, using fallback:', error.message);
        return fallbackDigest(alerts, location);
    }
}

// Agent 1: Query Generator & Expansion
// Generates and expands high-intent AI search queries for brand visibility monitoring

import { analyzeWithGPT } from '../services/openai';
import type { GEOAnalysisRequest, GeneratedQuery } from './types';

const QUERY_PATTERNS = {
    best: [
        'best {industry} in {market}',
        'best {industry} for startups',
        'best {industry} for small business',
        'best {industry} for enterprises',
        'top {industry} {market}',
    ],
    versus: [
        '{brand} vs {competitor}',
        '{competitor} vs {brand}',
        '{brand} alternatives',
        '{brand} competitors',
    ],
    for_segment: [
        '{industry} for Indian startups',
        '{industry} for SMBs',
        '{industry} for enterprise',
        'affordable {industry} for small business',
    ],
    how_to: [
        'how to choose {industry}',
        'how to evaluate {industry}',
        'what to look for in {industry}',
    ],
    what_is: [
        'what is the best {industry}',
        'which {industry} should I use',
        'recommended {industry} for {market}',
    ],
};

export async function generateQueries(request: GEOAnalysisRequest): Promise<GeneratedQuery[]> {
    const { brand, industry, competitors, market = 'India' } = request;

    // First, generate pattern-based queries
    const patternQueries: GeneratedQuery[] = [];

    // Best queries
    for (const pattern of QUERY_PATTERNS.best) {
        patternQueries.push({
            query: pattern.replace('{industry}', industry).replace('{market}', market),
            intent: 'commercial',
            category: 'best',
        });
    }

    // Versus queries for each competitor
    for (const competitor of competitors.slice(0, 3)) {
        const competitorName = competitor.replace('.com', '').replace('.', ' ');
        const brandName = brand.replace('.com', '').replace('.', ' ');

        patternQueries.push({
            query: `${brandName} vs ${competitorName}`,
            intent: 'comparison',
            category: 'versus',
        });
        patternQueries.push({
            query: `${competitorName} vs ${brandName}`,
            intent: 'comparison',
            category: 'versus',
        });
    }

    // Segment queries
    for (const pattern of QUERY_PATTERNS.for_segment) {
        patternQueries.push({
            query: pattern.replace('{industry}', industry),
            intent: 'commercial',
            category: 'for_segment',
        });
    }

    // How-to queries
    for (const pattern of QUERY_PATTERNS.how_to) {
        patternQueries.push({
            query: pattern.replace('{industry}', industry),
            intent: 'informational',
            category: 'how_to',
        });
    }

    // What-is queries
    for (const pattern of QUERY_PATTERNS.what_is) {
        patternQueries.push({
            query: pattern.replace('{industry}', industry).replace('{market}', market),
            intent: 'informational',
            category: 'what_is',
        });
    }

    // Now, use AI to generate additional contextual queries
    try {
        const aiQueries = await generateAIQueries(request);
        return [...patternQueries, ...aiQueries].slice(0, 20); // Limit to 20 queries
    } catch (error) {
        console.error('Failed to generate AI queries, using pattern queries only:', error);
        return patternQueries.slice(0, 20);
    }
}

async function generateAIQueries(request: GEOAnalysisRequest): Promise<GeneratedQuery[]> {
    const { brand, industry, competitors, market = 'India' } = request;

    const prompt = `Generate 5 unique AI search queries that a user might ask an AI assistant about ${industry} in ${market}.

The brand we're monitoring is: ${brand}
Key competitors: ${competitors.join(', ')}

Generate queries that are:
1. Natural language questions users would ask ChatGPT/Claude/Gemini
2. Mix of informational and commercial intent
3. Relevant to the ${market} market

Return as JSON array with format:
[
  {"query": "...", "intent": "informational|commercial|comparison", "category": "best|versus|for_segment|how_to|what_is"}
]

Only return the JSON array, no other text.`;

    const response = await analyzeWithGPT(prompt, {
        systemPrompt: 'You are a search query expert. Generate realistic AI search queries. Return only valid JSON.',
        jsonMode: true,
        temperature: 0.8,
    });

    try {
        const parsed = JSON.parse(response);
        if (Array.isArray(parsed)) {
            return parsed.map((q: any) => ({
                query: String(q.query || ''),
                intent: q.intent || 'informational',
                category: q.category || 'what_is',
            }));
        }
        return [];
    } catch {
        console.error('Failed to parse AI query response');
        return [];
    }
}

// ==================== Query Expansion Agent ====================

export interface ExpandedQuery {
    query: string;
    intentType: 'commercial' | 'comparison' | 'persona' | 'informational';
    priority: 'high' | 'medium' | 'low';
    reason: string;
}

export interface QueryExpansionResult {
    newQueries: ExpandedQuery[];
    totalCount: number;
}

/**
 * Query Expansion Agent
 * Continuously expands and improves the list of AI-search queries
 */
export async function expandQueries(
    request: GEOAnalysisRequest,
    existingQueries: string[] = []
): Promise<QueryExpansionResult> {
    const { brand, industry, competitors, market = 'India' } = request;

    const prompt = `You are a Query Expansion Agent for GEO (Generative Engine Optimization).

Generate 15-25 high-quality AI search queries for this brand:

Brand: ${brand}
Industry: ${industry}
Competitors: ${competitors.join(', ')}
Market: ${market}

Existing queries to avoid duplicating:
${existingQueries.slice(0, 10).map(q => `- ${q}`).join('\n')}

Generate queries across these buckets:

1. Commercial Intent
- "best <category> in India"
- "top <category> tools for startups"
- "<category> pricing comparison"

2. Comparison Intent
- "<brand> vs <competitor>"
- "<competitor> alternatives"
- "is <brand> better than <competitor>"

3. Use-case / Persona Intent
- "<category> for MSMEs"
- "<category> for Indian startups"

4. Informational AI-style Queries
- "what is the best <category> AI recommends"
- "how to choose <category>"

QUALITY RULES:
- Queries must sound like something a user would ask ChatGPT
- Avoid SEO keyword stuffing
- Prefer natural language
- Focus on India-first phrasing

Return ONLY valid JSON:
{
  "new_queries": [
    {
      "query": "",
      "intent_type": "commercial | comparison | persona | informational",
      "priority": "high | medium | low",
      "reason": "why this query matters"
    }
  ]
}`;

    try {
        const response = await analyzeWithGPT(prompt, {
            systemPrompt: 'You are a GEO query expansion expert. Think like a growth strategist, not an SEO tool. Return only valid JSON.',
            jsonMode: true,
            temperature: 0.7,
        });

        const parsed = JSON.parse(response);
        const newQueries: ExpandedQuery[] = (parsed.new_queries || []).map((q: any) => ({
            query: String(q.query || ''),
            intentType: q.intent_type || 'informational',
            priority: q.priority || 'medium',
            reason: String(q.reason || ''),
        }));

        // Filter out duplicates with existing queries
        const uniqueQueries = newQueries.filter(
            nq => !existingQueries.some(
                eq => eq.toLowerCase().trim() === nq.query.toLowerCase().trim()
            )
        );

        return {
            newQueries: uniqueQueries,
            totalCount: uniqueQueries.length,
        };
    } catch (error) {
        console.error('Query expansion failed:', error);
        return {
            newQueries: [],
            totalCount: 0,
        };
    }
}


// Agent 2: AI Search Simulation Agent
// Simulates how AI search engines would answer queries and extracts brand mentions

import { analyzeWithGPT } from '../services/openai';
import type { GeneratedQuery, SimulationResult } from './types';

export async function simulateSearch(
    query: GeneratedQuery,
    brand: string,
    competitors: string[]
): Promise<SimulationResult> {
    // First, generate an AI search response
    const aiResponse = await generateAIResponse(query.query);

    // Then analyze the response for brand mentions
    const analysis = analyzeResponse(aiResponse, brand, competitors);

    return {
        query: query.query,
        aiResponse,
        brandFound: analysis.brandFound,
        brandPosition: analysis.brandPosition,
        competitorsFound: analysis.competitorsFound,
        sentiment: analysis.sentiment,
        timestamp: new Date(),
    };
}

export async function simulateAllSearches(
    queries: GeneratedQuery[],
    brand: string,
    competitors: string[]
): Promise<SimulationResult[]> {
    const results: SimulationResult[] = [];

    // Process queries sequentially to avoid rate limiting
    for (const query of queries) {
        try {
            const result = await simulateSearch(query, brand, competitors);
            results.push(result);
        } catch (error) {
            console.error(`Failed to simulate search for query: ${query.query}`, error);
            // Add a failed result
            results.push({
                query: query.query,
                aiResponse: '',
                brandFound: false,
                brandPosition: 'absent',
                competitorsFound: [],
                sentiment: 'neutral',
                timestamp: new Date(),
            });
        }
    }

    return results;
}

async function generateAIResponse(query: string): Promise<string> {
    const prompt = `You are a helpful AI assistant answering a user's question. Respond naturally and informatively.

User Question: ${query}

Guidelines:
- Be helpful and informative
- Mention relevant products/services if applicable
- Do NOT force any brand mentions - only mention brands if truly relevant
- Keep response concise (2-3 paragraphs max)
- Be neutral and objective`;

    const response = await analyzeWithGPT(prompt, {
        systemPrompt: 'You are a helpful AI search assistant similar to ChatGPT, Claude, or Perplexity. Provide informative, balanced responses.',
        temperature: 0.7,
    });

    return response;
}

function analyzeResponse(
    response: string,
    brand: string,
    competitors: string[]
): {
    brandFound: boolean;
    brandPosition: 'top' | 'middle' | 'bottom' | 'absent';
    competitorsFound: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
} {
    const responseLower = response.toLowerCase();
    const brandLower = brand.toLowerCase().replace('.com', '').replace('.', ' ');
    const brandVariants = [
        brandLower,
        brandLower.replace(/\s+/g, ''),
        brand.toLowerCase(),
    ];

    // Check if brand is mentioned
    const brandFound = brandVariants.some(v => responseLower.includes(v));

    // Determine brand position
    let brandPosition: 'top' | 'middle' | 'bottom' | 'absent' = 'absent';
    if (brandFound) {
        const firstMentionIndex = Math.min(
            ...brandVariants
                .map(v => responseLower.indexOf(v))
                .filter(i => i >= 0)
        );

        const responseLength = response.length;
        const relativePosition = firstMentionIndex / responseLength;

        if (relativePosition < 0.33) {
            brandPosition = 'top';
        } else if (relativePosition < 0.66) {
            brandPosition = 'middle';
        } else {
            brandPosition = 'bottom';
        }
    }

    // Check which competitors are mentioned
    const competitorsFound: string[] = [];
    for (const competitor of competitors) {
        const competitorLower = competitor.toLowerCase().replace('.com', '').replace('.', ' ');
        const competitorVariants = [
            competitorLower,
            competitorLower.replace(/\s+/g, ''),
            competitor.toLowerCase(),
        ];

        if (competitorVariants.some(v => responseLower.includes(v))) {
            competitorsFound.push(competitor);
        }
    }

    // Analyze sentiment (simple keyword-based for now)
    const positiveWords = ['excellent', 'great', 'best', 'top', 'leading', 'recommended', 'popular', 'trusted'];
    const negativeWords = ['poor', 'lacking', 'limited', 'issues', 'problems', 'concerns', 'expensive'];

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';

    if (brandFound) {
        // Check context around brand mention
        const brandContext = extractBrandContext(response, brandVariants);
        const positiveCount = positiveWords.filter(w => brandContext.includes(w)).length;
        const negativeCount = negativeWords.filter(w => brandContext.includes(w)).length;

        if (positiveCount > negativeCount) {
            sentiment = 'positive';
        } else if (negativeCount > positiveCount) {
            sentiment = 'negative';
        }
    }

    return {
        brandFound,
        brandPosition,
        competitorsFound,
        sentiment,
    };
}

function extractBrandContext(response: string, brandVariants: string[]): string {
    const responseLower = response.toLowerCase();

    for (const variant of brandVariants) {
        const index = responseLower.indexOf(variant);
        if (index >= 0) {
            // Extract 100 characters before and after the brand mention
            const start = Math.max(0, index - 100);
            const end = Math.min(response.length, index + variant.length + 100);
            return responseLower.substring(start, end);
        }
    }

    return '';
}

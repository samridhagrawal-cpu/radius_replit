// Agent 6: Content Gap Analysis Agent
// Identifies queries where competitors dominate and recommends content

import type { SimulationResult, ContentRecommendation, GEOAnalysisRequest } from './types';

export function analyzeContentGaps(
    simulations: SimulationResult[],
    request: GEOAnalysisRequest
): ContentRecommendation[] {
    const recommendations: ContentRecommendation[] = [];

    // Find queries where brand is absent but competitors are mentioned
    const competitorDominatedQueries = simulations.filter(
        sim => !sim.brandFound && sim.competitorsFound.length > 0
    );

    // Find queries where brand is in bottom/middle but competitors are mentioned
    const weakPositionQueries = simulations.filter(
        sim => sim.brandFound &&
            (sim.brandPosition === 'bottom' || sim.brandPosition === 'middle') &&
            sim.competitorsFound.length > 0
    );

    // Find queries where brand is completely absent
    const absentQueries = simulations.filter(
        sim => !sim.brandFound
    );

    // Generate recommendations for competitor-dominated queries (highest priority)
    for (const sim of competitorDominatedQueries.slice(0, 5)) {
        const recommendation = generateRecommendation(sim, request, 'high');
        if (recommendation) {
            recommendations.push(recommendation);
        }
    }

    // Generate recommendations for weak position queries (medium priority)
    for (const sim of weakPositionQueries.slice(0, 3)) {
        const recommendation = generateRecommendation(sim, request, 'medium');
        if (recommendation) {
            recommendations.push(recommendation);
        }
    }

    // Generate recommendations for absent queries (lower priority if not competitor-dominated)
    const purelyAbsentQueries = absentQueries.filter(
        sim => sim.competitorsFound.length === 0
    );

    for (const sim of purelyAbsentQueries.slice(0, 2)) {
        const recommendation = generateRecommendation(sim, request, 'low');
        if (recommendation) {
            recommendations.push(recommendation);
        }
    }

    return recommendations;
}

function generateRecommendation(
    sim: SimulationResult,
    request: GEOAnalysisRequest,
    priority: 'high' | 'medium' | 'low'
): ContentRecommendation | null {
    const query = sim.query.toLowerCase();
    const { brand, industry, competitors } = request;

    // Determine content type based on query pattern
    if (query.includes(' vs ') || query.includes('versus') || query.includes('compare')) {
        // Comparison query → create comparison page
        const competitor = sim.competitorsFound[0] || competitors[0] || 'competitor';
        return {
            type: 'comparison_page',
            title: `${brand} vs ${competitor}: Complete Comparison`,
            description: `Create a detailed, fair comparison page that highlights your strengths while acknowledging competitor features. Include specs table, pricing, use cases, and verdict.`,
            targetQuery: sim.query,
            priority,
            expectedImpact: 'High chance of being cited when users ask comparison questions in AI search.',
        };
    }

    if (query.includes('best') || query.includes('top')) {
        // Best/Top query → create authoritative blog
        return {
            type: 'blog',
            title: `Best ${industry} in ${request.market || 'India'}: Complete Guide`,
            description: `Create a comprehensive guide that positions your brand among the best options. Include criteria for evaluation, detailed reviews, and clear recommendations.`,
            targetQuery: sim.query,
            priority,
            expectedImpact: 'AI models often cite comprehensive "best of" guides when answering similar queries.',
        };
    }

    if (query.includes('how to') || query.includes('what is') || query.includes('guide')) {
        // Educational query → create FAQ or guide
        return {
            type: 'faq',
            title: `${industry} FAQ: Everything You Need to Know`,
            description: `Create a detailed FAQ page answering common questions. Use clear definitions, bullet points, and structured data. Include your brand naturally as a solution.`,
            targetQuery: sim.query,
            priority,
            expectedImpact: 'AI models frequently cite FAQ pages for informational queries.',
        };
    }

    if (query.includes('for startups') || query.includes('for small') || query.includes('for enterprise')) {
        // Segment-specific query → create targeted landing page
        const segment = extractSegment(query);
        return {
            type: 'landing_page',
            title: `${brand} for ${segment}: Purpose-Built Solution`,
            description: `Create a dedicated landing page for this market segment. Include testimonials, case studies, and specific features relevant to ${segment}.`,
            targetQuery: sim.query,
            priority,
            expectedImpact: 'Targeted landing pages improve citation rates for segment-specific queries.',
        };
    }

    // Default recommendation
    return {
        type: 'blog',
        title: `${industry}: A Complete Guide`,
        description: `Create comprehensive content addressing "${sim.query}". Include factual information, examples, and position your brand as a trusted option.`,
        targetQuery: sim.query,
        priority,
        expectedImpact: 'Well-structured content improves overall AI visibility.',
    };
}

function extractSegment(query: string): string {
    if (query.includes('startup')) return 'Startups';
    if (query.includes('small business') || query.includes('smb')) return 'Small Businesses';
    if (query.includes('enterprise')) return 'Enterprises';
    if (query.includes('indian')) return 'Indian Businesses';
    return 'Businesses';
}

export function prioritizeRecommendations(
    recommendations: ContentRecommendation[]
): ContentRecommendation[] {
    return recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

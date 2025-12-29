// Agent 4: Visibility Scoring Agent
// Computes visibility score using defined scoring logic

import type { SimulationResult, VisibilityScore } from './types';

const SCORING_WEIGHTS = {
    BRAND_MENTIONED: 2,
    BRAND_TOP_POSITION: 3,
    BRAND_MIDDLE_POSITION: 1,
    BRAND_BOTTOM_POSITION: 0,
    COMPETITOR_PENALTY: -1,
    NEGATIVE_SENTIMENT_PENALTY: -2,
};

export function calculateVisibilityScore(
    simulations: SimulationResult[],
    brand: string
): VisibilityScore {
    let totalScore = 0;
    let brandMentions = 0;
    let topPositions = 0;
    let middlePositions = 0;
    let competitorPenalty = 0;
    let sentimentPenalty = 0;

    // Calculate max possible score (if brand is mentioned at top with positive sentiment for all queries)
    const maxPossibleScore = simulations.length * (SCORING_WEIGHTS.BRAND_MENTIONED + SCORING_WEIGHTS.BRAND_TOP_POSITION);

    for (const sim of simulations) {
        // Brand mention scoring
        if (sim.brandFound) {
            totalScore += SCORING_WEIGHTS.BRAND_MENTIONED;
            brandMentions++;

            // Position scoring
            switch (sim.brandPosition) {
                case 'top':
                    totalScore += SCORING_WEIGHTS.BRAND_TOP_POSITION;
                    topPositions++;
                    break;
                case 'middle':
                    totalScore += SCORING_WEIGHTS.BRAND_MIDDLE_POSITION;
                    middlePositions++;
                    break;
                case 'bottom':
                    totalScore += SCORING_WEIGHTS.BRAND_BOTTOM_POSITION;
                    break;
            }

            // Sentiment penalty
            if (sim.sentiment === 'negative') {
                totalScore += SCORING_WEIGHTS.NEGATIVE_SENTIMENT_PENALTY;
                sentimentPenalty += Math.abs(SCORING_WEIGHTS.NEGATIVE_SENTIMENT_PENALTY);
            }
        }

        // Competitor penalty
        const competitorCount = sim.competitorsFound.length;
        totalScore += competitorCount * SCORING_WEIGHTS.COMPETITOR_PENALTY;
        competitorPenalty += competitorCount * Math.abs(SCORING_WEIGHTS.COMPETITOR_PENALTY);
    }

    // Ensure score doesn't go below 0
    totalScore = Math.max(0, totalScore);

    // Calculate percentage (0-100)
    const percentage = Math.round((totalScore / Math.max(1, maxPossibleScore)) * 100);

    // Generate explanation
    const explanation = generateExplanation({
        totalQueries: simulations.length,
        brandMentions,
        topPositions,
        middlePositions,
        competitorPenalty,
        sentimentPenalty,
        percentage,
    });

    return {
        score: totalScore,
        maxPossibleScore,
        percentage,
        explanation,
        breakdown: {
            brandMentions,
            topPositions,
            middlePositions,
            competitorPenalty,
            sentimentPenalty,
        },
    };
}

function generateExplanation(data: {
    totalQueries: number;
    brandMentions: number;
    topPositions: number;
    middlePositions: number;
    competitorPenalty: number;
    sentimentPenalty: number;
    percentage: number;
}): string {
    const {
        totalQueries,
        brandMentions,
        topPositions,
        middlePositions,
        percentage,
    } = data;

    const mentionRate = Math.round((brandMentions / totalQueries) * 100);
    const topRate = brandMentions > 0 ? Math.round((topPositions / brandMentions) * 100) : 0;

    let level: string;
    if (percentage >= 70) {
        level = 'Strong';
    } else if (percentage >= 50) {
        level = 'Moderate';
    } else if (percentage >= 25) {
        level = 'Developing';
    } else {
        level = 'Low';
    }

    let explanation = `${level} AI visibility (${percentage}%). `;
    explanation += `Your brand was mentioned in ${brandMentions}/${totalQueries} AI responses (${mentionRate}%). `;

    if (topPositions > 0) {
        explanation += `You appeared in the top position ${topPositions} time${topPositions > 1 ? 's' : ''} (${topRate}% of mentions). `;
    }

    if (middlePositions > 0) {
        explanation += `Middle position: ${middlePositions} times. `;
    }

    if (data.competitorPenalty > 0) {
        explanation += `Competitors were mentioned frequently, indicating competitive pressure. `;
    }

    if (data.sentimentPenalty > 0) {
        explanation += `Some responses had negative sentiment about your brand. `;
    }

    return explanation.trim();
}

export function compareScores(
    currentScore: VisibilityScore,
    previousScore: VisibilityScore
): {
    change: number;
    direction: 'up' | 'down' | 'stable';
    summary: string;
} {
    const change = currentScore.percentage - previousScore.percentage;

    let direction: 'up' | 'down' | 'stable';
    if (change > 5) {
        direction = 'up';
    } else if (change < -5) {
        direction = 'down';
    } else {
        direction = 'stable';
    }

    let summary: string;
    if (direction === 'up') {
        summary = `Visibility improved by ${change}% from ${previousScore.percentage}% to ${currentScore.percentage}%`;
    } else if (direction === 'down') {
        summary = `Visibility dropped by ${Math.abs(change)}% from ${previousScore.percentage}% to ${currentScore.percentage}%`;
    } else {
        summary = `Visibility stable at ${currentScore.percentage}% (±${Math.abs(change)}%)`;
    }

    return { change, direction, summary };
}

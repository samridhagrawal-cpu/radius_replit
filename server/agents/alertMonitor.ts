// Agent 5: Monitoring & Alert Agent (Enhanced)
// Detects meaningful changes in brand visibility over time

import type {
    SimulationResult,
    VisibilityScore,
    Alert,
    GEOAnalysisResult
} from './types';

/**
 * Enhanced alert generation following strict rules:
 * - Trigger ONLY if visibility drops 20%+ OR brand disappears from top OR competitor replaces brand
 * - Be conservative to avoid false alarms
 * - Explain WHY the change matters
 */
export function generateAlerts(
    current: {
        simulations: SimulationResult[];
        visibilityScore: VisibilityScore;
    },
    previous: GEOAnalysisResult | undefined,
    brand: string
): Alert[] {
    const alerts: Alert[] = [];

    if (!previous) {
        // First run - no alerts to generate
        return alerts;
    }

    // Rule 1: Check for visibility score drop of 20% or more
    const visibilityDropAlert = checkVisibilityDrop(
        current.visibilityScore,
        previous.visibilityScore
    );
    if (visibilityDropAlert) {
        alerts.push(visibilityDropAlert);
    }

    // Rule 2: Check for brand disappearing from top answers
    const disappearanceAlerts = checkBrandDisappearance(
        current.simulations,
        previous.simulations
    );
    alerts.push(...disappearanceAlerts);

    // Rule 3: Check for competitor replacing brand
    const competitorAlerts = checkCompetitorReplacement(
        current.simulations,
        previous.simulations,
        brand
    );
    alerts.push(...competitorAlerts);

    // Rule 4: Check for positive gains (informational, lower priority)
    const gainAlerts = checkVisibilityGains(
        current.simulations,
        previous.simulations
    );
    alerts.push(...gainAlerts);

    return alerts;
}

/**
 * Rule: Trigger if visibility score drops by 20% or more
 */
function checkVisibilityDrop(
    current: VisibilityScore,
    previous: VisibilityScore
): Alert | null {
    const absoluteDrop = previous.percentage - current.percentage;
    const relativeDrop = previous.percentage > 0
        ? (absoluteDrop / previous.percentage) * 100
        : 0;

    // Trigger only for 20%+ drop
    if (absoluteDrop >= 20 || relativeDrop >= 20) {
        const severity: 'high' | 'medium' | 'low' =
            absoluteDrop >= 30 ? 'high' :
                absoluteDrop >= 20 ? 'medium' : 'low';

        return {
            type: 'visibility_drop',
            severity,
            message: formatDropAlert(previous.percentage, current.percentage, absoluteDrop),
            query: 'Overall visibility score',
            previousState: {
                brandPosition: 'N/A',
                score: previous.percentage,
            },
            currentState: {
                brandPosition: 'N/A',
                score: current.percentage,
            },
            timestamp: new Date(),
        };
    }

    return null;
}

function formatDropAlert(prev: number, curr: number, drop: number): string {
    return `⚠️ ALERT TYPE: Drop

Query: "Overall visibility score"
Previous State:
- Visibility score: ${prev}%

Current State:
- Visibility score: ${curr}%

Impact Summary: Your brand visibility dropped by ${drop}% points. This significant decline suggests AI models are citing your brand less frequently, potentially due to competitor content improvements or changes in AI model training data.`;
}

/**
 * Rule: Trigger if brand disappears from top answers
 */
function checkBrandDisappearance(
    current: SimulationResult[],
    previous: SimulationResult[]
): Alert[] {
    const alerts: Alert[] = [];

    for (const currSim of current) {
        const prevSim = previous.find(p => p.query === currSim.query);
        if (!prevSim) continue;

        // Brand was in top position before, now absent or lower
        if (prevSim.brandFound && prevSim.brandPosition === 'top') {
            if (!currSim.brandFound || currSim.brandPosition === 'absent') {
                alerts.push({
                    type: 'brand_disappeared',
                    severity: 'high',
                    message: formatDisappearanceAlert(
                        currSim.query,
                        prevSim.brandPosition,
                        prevSim.competitorsFound,
                        currSim.brandPosition,
                        currSim.competitorsFound
                    ),
                    query: currSim.query,
                    previousState: {
                        brandPosition: prevSim.brandPosition,
                        score: 1,
                    },
                    currentState: {
                        brandPosition: currSim.brandFound ? currSim.brandPosition : 'absent',
                        score: 0,
                    },
                    timestamp: new Date(),
                });
            }
        }

        // Brand was mentioned before, now completely absent
        if (prevSim.brandFound && !currSim.brandFound) {
            // Avoid duplicate if already added above
            const alreadyAdded = alerts.some(a => a.query === currSim.query && a.type === 'brand_disappeared');
            if (!alreadyAdded) {
                alerts.push({
                    type: 'brand_disappeared',
                    severity: 'medium',
                    message: formatDisappearanceAlert(
                        currSim.query,
                        prevSim.brandPosition,
                        prevSim.competitorsFound,
                        'absent',
                        currSim.competitorsFound
                    ),
                    query: currSim.query,
                    previousState: {
                        brandPosition: prevSim.brandPosition,
                        score: 1,
                    },
                    currentState: {
                        brandPosition: 'absent',
                        score: 0,
                    },
                    timestamp: new Date(),
                });
            }
        }
    }

    return alerts;
}

function formatDisappearanceAlert(
    query: string,
    prevPosition: string,
    prevCompetitors: string[],
    currPosition: string,
    currCompetitors: string[]
): string {
    return `⚠️ ALERT TYPE: Drop

Query: "${query}"
Previous State:
- Brand position: ${prevPosition}
- Competitors present: ${prevCompetitors.length > 0 ? prevCompetitors.join(', ') : 'None'}

Current State:
- Brand position: ${currPosition}
- Competitors present: ${currCompetitors.length > 0 ? currCompetitors.join(', ') : 'None'}

Impact Summary: Your brand disappeared from AI answers for this query. Previously you held ${prevPosition} position. This loss means potential customers asking this question will not see your brand recommended.`;
}

/**
 * Rule: Trigger if competitor replaces brand in AI answer
 */
function checkCompetitorReplacement(
    current: SimulationResult[],
    previous: SimulationResult[],
    brand: string
): Alert[] {
    const alerts: Alert[] = [];

    for (const currSim of current) {
        const prevSim = previous.find(p => p.query === currSim.query);
        if (!prevSim) continue;

        // Brand was at top/middle, now a competitor appears prominently while brand is lower/absent
        if (prevSim.brandFound && (prevSim.brandPosition === 'top' || prevSim.brandPosition === 'middle')) {
            const brandWorsened = !currSim.brandFound ||
                (prevSim.brandPosition === 'top' && currSim.brandPosition !== 'top');

            const competitorGained = currSim.competitorsFound.length > prevSim.competitorsFound.length ||
                currSim.competitorsFound.some(c => !prevSim.competitorsFound.includes(c));

            if (brandWorsened && competitorGained) {
                const newCompetitors = currSim.competitorsFound.filter(c => !prevSim.competitorsFound.includes(c));

                alerts.push({
                    type: 'competitor_overtake',
                    severity: 'high',
                    message: formatCompetitorAlert(
                        currSim.query,
                        prevSim.brandPosition,
                        prevSim.competitorsFound,
                        currSim.brandFound ? currSim.brandPosition : 'absent',
                        currSim.competitorsFound,
                        newCompetitors
                    ),
                    query: currSim.query,
                    previousState: {
                        brandPosition: prevSim.brandPosition,
                        score: 1,
                    },
                    currentState: {
                        brandPosition: currSim.brandFound ? currSim.brandPosition : 'absent',
                        score: 0,
                    },
                    timestamp: new Date(),
                });
            }
        }
    }

    return alerts;
}

function formatCompetitorAlert(
    query: string,
    prevPosition: string,
    prevCompetitors: string[],
    currPosition: string,
    currCompetitors: string[],
    newCompetitors: string[]
): string {
    const threat = newCompetitors.length > 0 ? newCompetitors[0] : currCompetitors[0] || 'A competitor';

    return `⚠️ ALERT TYPE: Threat

Query: "${query}"
Previous State:
- Brand position: ${prevPosition}
- Competitors present: ${prevCompetitors.length > 0 ? prevCompetitors.join(', ') : 'None'}

Current State:
- Brand position: ${currPosition}
- Competitors present: ${currCompetitors.length > 0 ? currCompetitors.join(', ') : 'None'}

Impact Summary: ${threat} has replaced your brand in AI answers for this query. When users ask "${query}", they now see your competitor instead of you. This directly impacts lead generation and brand perception.`;
}

/**
 * Positive signals: Brand gains visibility (informational alerts)
 */
function checkVisibilityGains(
    current: SimulationResult[],
    previous: SimulationResult[]
): Alert[] {
    const alerts: Alert[] = [];

    for (const currSim of current) {
        const prevSim = previous.find(p => p.query === currSim.query);

        // Brand appears for a new query
        if (!prevSim && currSim.brandFound) {
            alerts.push({
                type: 'visibility_drop', // Using existing type, but positive
                severity: 'low',
                message: `✅ ALERT TYPE: Gain

Query: "${currSim.query}"
Previous State:
- Brand position: Not tracked

Current State:
- Brand position: ${currSim.brandPosition}
- Competitors present: ${currSim.competitorsFound.length > 0 ? currSim.competitorsFound.join(', ') : 'None'}

Impact Summary: Your brand now appears in AI answers for this new query. This is a positive signal indicating improved visibility.`,
                query: currSim.query,
                previousState: {
                    brandPosition: 'not_tracked',
                    score: 0,
                },
                currentState: {
                    brandPosition: currSim.brandPosition,
                    score: 1,
                },
                timestamp: new Date(),
            });
        }

        // Brand position improved
        if (prevSim && currSim.brandFound && prevSim.brandFound) {
            const positionImproved =
                (prevSim.brandPosition === 'bottom' && (currSim.brandPosition === 'middle' || currSim.brandPosition === 'top')) ||
                (prevSim.brandPosition === 'middle' && currSim.brandPosition === 'top');

            if (positionImproved) {
                alerts.push({
                    type: 'visibility_drop', // Using existing type, but positive
                    severity: 'low',
                    message: `✅ ALERT TYPE: Gain

Query: "${currSim.query}"
Previous State:
- Brand position: ${prevSim.brandPosition}

Current State:
- Brand position: ${currSim.brandPosition}

Impact Summary: Your brand position improved from ${prevSim.brandPosition} to ${currSim.brandPosition}. AI models are now recommending your brand more prominently for this query.`,
                    query: currSim.query,
                    previousState: {
                        brandPosition: prevSim.brandPosition,
                        score: 0,
                    },
                    currentState: {
                        brandPosition: currSim.brandPosition,
                        score: 1,
                    },
                    timestamp: new Date(),
                });
            }
        }
    }

    return alerts;
}

/**
 * Summary of all alerts for quick review
 */
export function summarizeAlerts(alerts: Alert[]): string {
    if (alerts.length === 0) {
        return 'No significant visibility changes detected.';
    }

    const drops = alerts.filter(a =>
        a.type === 'visibility_drop' && a.severity !== 'low'
    ).length;

    const threats = alerts.filter(a => a.type === 'competitor_overtake').length;
    const disappearances = alerts.filter(a => a.type === 'brand_disappeared').length;
    const gains = alerts.filter(a => a.severity === 'low').length;

    const parts: string[] = [];

    if (drops > 0) parts.push(`${drops} visibility drop${drops > 1 ? 's' : ''}`);
    if (threats > 0) parts.push(`${threats} competitor threat${threats > 1 ? 's' : ''}`);
    if (disappearances > 0) parts.push(`${disappearances} disappearance${disappearances > 1 ? 's' : ''}`);
    if (gains > 0) parts.push(`${gains} positive gain${gains > 1 ? 's' : ''}`);

    const critical = drops + threats + disappearances;

    if (critical > 0) {
        return `⚠️ ${critical} critical alert${critical > 1 ? 's' : ''}: ${parts.join(', ')}`;
    } else {
        return `✅ ${gains} positive signal${gains > 1 ? 's' : ''} detected.`;
    }
}

/**
 * Format a single alert for display
 */
export function formatAlert(alert: Alert): string {
    return alert.message;
}

/**
 * Get alerts grouped by type
 */
export function groupAlertsByType(alerts: Alert[]): {
    drops: Alert[];
    threats: Alert[];
    disappearances: Alert[];
    gains: Alert[];
} {
    return {
        drops: alerts.filter(a => a.type === 'visibility_drop' && a.severity !== 'low'),
        threats: alerts.filter(a => a.type === 'competitor_overtake'),
        disappearances: alerts.filter(a => a.type === 'brand_disappeared'),
        gains: alerts.filter(a => a.severity === 'low'),
    };
}
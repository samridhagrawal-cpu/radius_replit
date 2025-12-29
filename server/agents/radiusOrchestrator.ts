// Radius Front-Page Feature Orchestrator
// Coordinates all agents into a unified, product-like GEO platform

import {
    generateQueries,
    expandQueries,
    simulateAllSearches,
    calculateVisibilityScore,
    generateAlerts,
    summarizeAlerts,
    groupAlertsByType,
    analyzeContentGaps,
    prioritizeRecommendations,
    generateContent,
    autoPublish,
    storeAnalysisResult,
    getLatestAnalysis,
    getPreviousAnalysis,
    generateRunId,
    getHistoricalRuns
} from './index';

import type {
    GEOAnalysisRequest,
    GEOAnalysisResult,
    SimulationResult,
    VisibilityScore,
    Alert,
    ContentRecommendation,
    GeneratedContent
} from './types';

import type { PublishResult, StructuredContent } from './autoPublisher';

// ==================== Types ====================

export interface AIEngine {
    name: 'chatgpt' | 'gemini' | 'perplexity';
    displayName: string;
}

export interface EngineVisibility {
    engine: string;
    score: number;
    brandMentions: number;
    competitorMentions: number;
}

export interface CompetitorBenchmark {
    competitor: string;
    shareOfVoice: number; // percentage of queries where competitor appears
    averagePosition: string;
    dominatesOnQueries: string[];
}

export interface VisibilityGap {
    query: string;
    competitorsPresent: string[];
    severity: 'critical' | 'high' | 'medium';
    recommendation: string;
}

export interface RadiusOrchestrationResult {
    runId: string;
    timestamp: Date;
    brand: string;
    mode: 'full' | 'demo';

    // Module 1: AI Search Visibility
    ai_visibility_overview: {
        overallScore: number;
        explanation: string;
        brandMentionRate: number;
        topPositionRate: number;
        queriesAnalyzed: number;
    };

    // Module 2: Multi-Engine Monitoring
    multi_engine_visibility: EngineVisibility[];

    // Module 3: Competitive Benchmarking
    competitive_benchmarking: {
        brandShareOfVoice: number;
        competitors: CompetitorBenchmark[];
        dominanceStatus: string;
    };

    // Module 4: Query Intelligence
    query_intelligence: {
        totalQueries: number;
        highImpactQueries: string[];
        competitorDominatedQueries: string[];
        untappedOpportunities: string[];
    };

    // Module 5: Gap Detection
    visibility_gaps: VisibilityGap[];

    // Module 6: Content Recommendations
    recommended_actions: ContentRecommendation[];

    // Module 7: Content Generated
    content_generated: {
        status: 'ready' | 'generated' | 'none';
        items: GeneratedContent[];
    };

    // Module 8: Published Assets
    published_assets: {
        status: 'ready' | 'published' | 'none';
        items: PublishResult[];
    };

    // Module 9: Alerts
    alerts: {
        summary: string;
        critical: Alert[];
        warnings: Alert[];
        gains: Alert[];
    };

    // Module 10: Impact Summary
    impact_summary: string;

    // For feedback loop
    previousRunComparison?: {
        previousScore: number;
        currentScore: number;
        change: number;
        trend: 'improved' | 'declined' | 'stable';
    };
}

// ==================== Main Orchestrator ====================

/**
 * Radius - Main Orchestration Function
 * Coordinates all agents in the correct order to produce a unified result
 */
export async function runRadiusOrchestration(
    request: GEOAnalysisRequest,
    options: {
        mode?: 'full' | 'demo';
        generateContent?: boolean;
        autoPublish?: boolean;
        cmsCredentials?: {
            siteUrl: string;
            username: string;
            applicationPassword: string;
        };
    } = {}
): Promise<RadiusOrchestrationResult> {
    const { mode = 'demo', generateContent: shouldGenerateContent = false, autoPublish: shouldAutoPublish = false } = options;
    const runId = generateRunId();
    const timestamp = new Date();

    console.log(`[Radius] Starting orchestration run: ${runId}`);
    console.log(`[Radius] Mode: ${mode}, Brand: ${request.brand}`);

    // ========== STEP 1: QUERY INTELLIGENCE ==========
    console.log('[Radius] Step 1: Query Intelligence...');
    const queries = await generateQueries(request);

    // Also expand queries for intelligence
    const expandedResult = await expandQueries(request, queries.map(q => q.query));
    const highImpactQueries = expandedResult.newQueries
        .filter(q => q.priority === 'high')
        .map(q => q.query);

    // ========== STEP 2: AI SEARCH VISIBILITY ==========
    console.log('[Radius] Step 2: AI Search Visibility...');
    const simulations = await simulateAllSearches(queries, request.brand, request.competitors);

    // ========== STEP 3: VISIBILITY SCORING ==========
    console.log('[Radius] Step 3: Visibility Scoring...');
    const visibilityScore = calculateVisibilityScore(simulations, request.brand);

    // ========== STEP 4: COMPETITIVE BENCHMARKING ==========
    console.log('[Radius] Step 4: Competitive Benchmarking...');
    const benchmarking = computeCompetitiveBenchmarking(simulations, request.brand, request.competitors);

    // ========== STEP 5: GAP DETECTION ==========
    console.log('[Radius] Step 5: Gap Detection...');
    const gaps = detectVisibilityGaps(simulations, request.competitors);

    // ========== STEP 6: CONTENT RECOMMENDATIONS ==========
    console.log('[Radius] Step 6: Content Recommendations...');
    const contentGaps = analyzeContentGaps(simulations, request);
    const recommendations = prioritizeRecommendations(contentGaps);

    // ========== STEP 7: CONTENT GENERATION (if enabled) ==========
    let generatedContent: GeneratedContent[] = [];
    if (shouldGenerateContent && recommendations.length > 0) {
        console.log('[Radius] Step 7: Content Generation...');
        for (const rec of recommendations.slice(0, 2)) { // Generate up to 2
            try {
                const content = await generateContent(rec, request);
                generatedContent.push(content);
            } catch (error) {
                console.error('[Radius] Content generation failed:', error);
            }
        }
    }

    // ========== STEP 8: AUTO PUBLISHING (if enabled) ==========
    let publishedAssets: PublishResult[] = [];
    if (shouldAutoPublish && options.cmsCredentials && generatedContent.length > 0) {
        console.log('[Radius] Step 8: Auto Publishing...');
        // Publishing would happen here with the generated content
    }

    // ========== STEP 9: MONITORING & ALERTS ==========
    console.log('[Radius] Step 9: Monitoring & Alerts...');
    const previousAnalysis = getPreviousAnalysis(request.brand);
    const alerts = generateAlerts({ simulations, visibilityScore }, previousAnalysis, request.brand);
    const groupedAlerts = groupAlertsByType(alerts);

    // ========== STEP 10: FEEDBACK LOOP ==========
    let previousRunComparison;
    if (previousAnalysis) {
        const prevScore = previousAnalysis.visibilityScore.percentage;
        const currScore = visibilityScore.percentage;
        const change = currScore - prevScore;

        previousRunComparison = {
            previousScore: prevScore,
            currentScore: currScore,
            change,
            trend: change > 5 ? 'improved' as const : change < -5 ? 'declined' as const : 'stable' as const,
        };
    }

    // Store result for future comparisons
    const analysisResult: GEOAnalysisResult = {
        request,
        queries,
        simulations,
        visibilityScore,
        alerts,
        contentRecommendations: recommendations,
        timestamp,
        runId,
    };
    storeAnalysisResult(analysisResult);

    // ========== BUILD RESULT ==========
    const result: RadiusOrchestrationResult = {
        runId,
        timestamp,
        brand: request.brand,
        mode,

        // Module 1
        ai_visibility_overview: {
            overallScore: visibilityScore.percentage,
            explanation: visibilityScore.explanation,
            brandMentionRate: Math.round((visibilityScore.breakdown.brandMentions / simulations.length) * 100),
            topPositionRate: Math.round((visibilityScore.breakdown.topPositions / Math.max(1, visibilityScore.breakdown.brandMentions)) * 100),
            queriesAnalyzed: simulations.length,
        },

        // Module 2
        multi_engine_visibility: simulateMultiEngineVisibility(simulations, request.brand, request.competitors),

        // Module 3
        competitive_benchmarking: benchmarking,

        // Module 4
        query_intelligence: {
            totalQueries: queries.length,
            highImpactQueries: highImpactQueries.slice(0, 5),
            competitorDominatedQueries: simulations
                .filter(s => !s.brandFound && s.competitorsFound.length > 0)
                .map(s => s.query)
                .slice(0, 5),
            untappedOpportunities: simulations
                .filter(s => !s.brandFound && s.competitorsFound.length === 0)
                .map(s => s.query)
                .slice(0, 5),
        },

        // Module 5
        visibility_gaps: gaps,

        // Module 6
        recommended_actions: recommendations,

        // Module 7
        content_generated: {
            status: generatedContent.length > 0 ? 'generated' : shouldGenerateContent ? 'ready' : 'none',
            items: generatedContent,
        },

        // Module 8
        published_assets: {
            status: publishedAssets.length > 0 ? 'published' : shouldAutoPublish ? 'ready' : 'none',
            items: publishedAssets,
        },

        // Module 9
        alerts: {
            summary: summarizeAlerts(alerts),
            critical: [...groupedAlerts.drops, ...groupedAlerts.threats, ...groupedAlerts.disappearances],
            warnings: alerts.filter(a => a.severity === 'medium'),
            gains: groupedAlerts.gains,
        },

        // Module 10
        impact_summary: generateImpactSummary(visibilityScore, alerts, gaps, previousRunComparison),

        previousRunComparison,
    };

    console.log(`[Radius] Orchestration complete. Score: ${visibilityScore.percentage}%`);

    return result;
}

// ==================== Helper Functions ====================

function computeCompetitiveBenchmarking(
    simulations: SimulationResult[],
    brand: string,
    competitors: string[]
): { brandShareOfVoice: number; competitors: CompetitorBenchmark[]; dominanceStatus: string } {
    const brandMentions = simulations.filter(s => s.brandFound).length;
    const brandShareOfVoice = Math.round((brandMentions / simulations.length) * 100);

    const competitorBenchmarks: CompetitorBenchmark[] = competitors.map(competitor => {
        const mentions = simulations.filter(s => s.competitorsFound.includes(competitor));
        const dominatesOn = simulations
            .filter(s => s.competitorsFound.includes(competitor) && !s.brandFound)
            .map(s => s.query);

        return {
            competitor,
            shareOfVoice: Math.round((mentions.length / simulations.length) * 100),
            averagePosition: 'varies', // Simplified
            dominatesOnQueries: dominatesOn.slice(0, 3),
        };
    });

    // Determine dominance status
    const topCompetitor = competitorBenchmarks.reduce((a, b) =>
        a.shareOfVoice > b.shareOfVoice ? a : b
        , { shareOfVoice: 0 } as CompetitorBenchmark);

    let dominanceStatus: string;
    if (brandShareOfVoice > topCompetitor.shareOfVoice + 20) {
        dominanceStatus = 'Brand leads with strong AI visibility';
    } else if (brandShareOfVoice > topCompetitor.shareOfVoice) {
        dominanceStatus = 'Brand leads but competition is close';
    } else if (brandShareOfVoice === topCompetitor.shareOfVoice) {
        dominanceStatus = 'Tied with competitors - room for improvement';
    } else {
        dominanceStatus = `${topCompetitor.competitor} currently dominates AI recommendations`;
    }

    return {
        brandShareOfVoice,
        competitors: competitorBenchmarks,
        dominanceStatus,
    };
}

function detectVisibilityGaps(
    simulations: SimulationResult[],
    competitors: string[]
): VisibilityGap[] {
    const gaps: VisibilityGap[] = [];

    for (const sim of simulations) {
        if (!sim.brandFound && sim.competitorsFound.length > 0) {
            const severity: 'critical' | 'high' | 'medium' =
                sim.competitorsFound.length >= 2 ? 'critical' :
                    sim.competitorsFound.length === 1 ? 'high' : 'medium';

            gaps.push({
                query: sim.query,
                competitorsPresent: sim.competitorsFound,
                severity,
                recommendation: `Create authoritative content targeting "${sim.query}" to displace ${sim.competitorsFound[0]}`,
            });
        }
    }

    // Sort by severity
    return gaps.sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2 };
        return order[a.severity] - order[b.severity];
    }).slice(0, 10);
}

function simulateMultiEngineVisibility(
    simulations: SimulationResult[],
    brand: string,
    competitors: string[]
): EngineVisibility[] {
    // Simulate different engine perspectives from the same data
    // In reality, you'd call different APIs

    const engines: AIEngine[] = [
        { name: 'chatgpt', displayName: 'ChatGPT-style' },
        { name: 'gemini', displayName: 'Gemini-style' },
        { name: 'perplexity', displayName: 'Perplexity-style' },
    ];

    return engines.map((engine, idx) => {
        // Simulate variance between engines
        const variance = (idx - 1) * 5; // -5, 0, +5
        const brandMentions = simulations.filter(s => s.brandFound).length;
        const competitorMentions = simulations.reduce((sum, s) => sum + s.competitorsFound.length, 0);
        const baseScore = Math.round((brandMentions / simulations.length) * 100);

        return {
            engine: engine.displayName,
            score: Math.max(0, Math.min(100, baseScore + variance)),
            brandMentions: brandMentions,
            competitorMentions: Math.round(competitorMentions / Math.max(1, simulations.length)),
        };
    });
}

function generateImpactSummary(
    score: VisibilityScore,
    alerts: Alert[],
    gaps: VisibilityGap[],
    comparison?: { previousScore: number; currentScore: number; change: number; trend: string }
): string {
    const parts: string[] = [];

    // Score summary
    if (score.percentage >= 70) {
        parts.push(`Your brand has strong AI visibility (${score.percentage}%).`);
    } else if (score.percentage >= 40) {
        parts.push(`Your brand has moderate AI visibility (${score.percentage}%) with room for improvement.`);
    } else {
        parts.push(`Your brand has low AI visibility (${score.percentage}%). Urgent action recommended.`);
    }

    // Gaps
    if (gaps.length > 0) {
        const criticalGaps = gaps.filter(g => g.severity === 'critical').length;
        if (criticalGaps > 0) {
            parts.push(`Radius detected ${criticalGaps} critical visibility gaps where competitors dominate.`);
        } else {
            parts.push(`Radius identified ${gaps.length} AI visibility gaps to address.`);
        }
    }

    // Trend
    if (comparison) {
        if (comparison.trend === 'improved') {
            parts.push(`Visibility improved by ${comparison.change}% since last analysis.`);
        } else if (comparison.trend === 'declined') {
            parts.push(`⚠️ Visibility dropped by ${Math.abs(comparison.change)}% since last analysis.`);
        }
    }

    // Alerts
    const criticalAlerts = alerts.filter(a => a.severity === 'high').length;
    if (criticalAlerts > 0) {
        parts.push(`${criticalAlerts} critical alert(s) require immediate attention.`);
    }

    return parts.join(' ');
}

/**
 * Homepage Demo Mode
 * Returns a simplified, marketing-friendly version of the results
 */
export function formatForHomepage(result: RadiusOrchestrationResult): {
    headline: string;
    score: number;
    keyInsights: string[];
    callToAction: string;
} {
    const keyInsights: string[] = [];

    // Visibility insight
    keyInsights.push(`AI visibility score: ${result.ai_visibility_overview.overallScore}%`);

    // Gap insight
    if (result.visibility_gaps.length > 0) {
        keyInsights.push(`${result.visibility_gaps.length} visibility gaps detected`);
    }

    // Competition insight
    keyInsights.push(result.competitive_benchmarking.dominanceStatus);

    // Trend insight
    if (result.previousRunComparison) {
        if (result.previousRunComparison.trend === 'improved') {
            keyInsights.push(`📈 ${result.previousRunComparison.change}% improvement since last run`);
        }
    }

    let headline: string;
    if (result.ai_visibility_overview.overallScore >= 70) {
        headline = 'Your brand is well-positioned in AI search';
    } else if (result.ai_visibility_overview.overallScore >= 40) {
        headline = 'Your brand has growth potential in AI search';
    } else {
        headline = 'Your competitors are winning in AI search';
    }

    return {
        headline,
        score: result.ai_visibility_overview.overallScore,
        keyInsights,
        callToAction: result.visibility_gaps.length > 0
            ? 'Generate AI-optimized content to fill visibility gaps'
            : 'Continue monitoring to maintain your AI visibility',
    };
}

/**
 * Get quick status for dashboard
 */
export function getRadiusQuickStatus(brand: string): {
    hasData: boolean;
    lastScore?: number;
    trend?: 'up' | 'down' | 'stable';
    lastRun?: Date;
} {
    const latest = getLatestAnalysis(brand);

    if (!latest) {
        return { hasData: false };
    }

    const previous = getPreviousAnalysis(brand);
    let trend: 'up' | 'down' | 'stable' = 'stable';

    if (previous) {
        const change = latest.visibilityScore.percentage - previous.visibilityScore.percentage;
        if (change > 5) trend = 'up';
        else if (change < -5) trend = 'down';
    }

    return {
        hasData: true,
        lastScore: latest.visibilityScore.percentage,
        trend,
        lastRun: latest.timestamp,
    };
}

// ==================== GEO_SNAPSHOT ====================

/**
 * GEO_SNAPSHOT - Final output object for every run
 * Contains all key metrics in a clean JSON format
 */
export interface GEO_SNAPSHOT {
    ai_visibility_overview: {
        overallScore: number;
        explanation: string;
        brandMentionRate: number;
        topPositionRate: number;
        queriesAnalyzed: number;
    };
    competitive_benchmarking: {
        brandShareOfVoice: number;
        competitors: Array<{
            competitor: string;
            shareOfVoice: number;
            dominatesOnQueries: string[];
        }>;
        dominanceStatus: string;
    };
    query_intelligence: {
        totalQueries: number;
        highImpactQueries: string[];
        competitorDominatedQueries: string[];
        untappedOpportunities: string[];
    };
    visibility_gaps: Array<{
        query: string;
        competitorsPresent: string[];
        severity: string;
        recommendation: string;
    }>;
    content_generated: {
        status: string;
        count: number;
        titles: string[];
    };
    published_assets: {
        status: string;
        count: number;
        urls: string[];
    };
    alerts: {
        summary: string;
        criticalCount: number;
        warningCount: number;
        gainCount: number;
    };
    impact_summary: string;
}

/**
 * Extract GEO_SNAPSHOT from RadiusOrchestrationResult
 * Returns clean JSON for final output
 */
export function extractGEOSnapshot(result: RadiusOrchestrationResult): GEO_SNAPSHOT {
    return {
        ai_visibility_overview: result.ai_visibility_overview,
        competitive_benchmarking: {
            brandShareOfVoice: result.competitive_benchmarking.brandShareOfVoice,
            competitors: result.competitive_benchmarking.competitors.map(c => ({
                competitor: c.competitor,
                shareOfVoice: c.shareOfVoice,
                dominatesOnQueries: c.dominatesOnQueries,
            })),
            dominanceStatus: result.competitive_benchmarking.dominanceStatus,
        },
        query_intelligence: result.query_intelligence,
        visibility_gaps: result.visibility_gaps.map(g => ({
            query: g.query,
            competitorsPresent: g.competitorsPresent,
            severity: g.severity,
            recommendation: g.recommendation,
        })),
        content_generated: {
            status: result.content_generated.status,
            count: result.content_generated.items.length,
            titles: result.content_generated.items.map(c => c.title),
        },
        published_assets: {
            status: result.published_assets.status,
            count: result.published_assets.items.length,
            urls: result.published_assets.items
                .filter(p => p.status === 'published' && p.postUrl)
                .map(p => p.postUrl as string),
        },
        alerts: {
            summary: result.alerts.summary,
            criticalCount: result.alerts.critical.length,
            warningCount: result.alerts.warnings.length,
            gainCount: result.alerts.gains.length,
        },
        impact_summary: result.impact_summary,
    };
}


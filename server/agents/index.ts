// Main entry point for the GEO Multi-Agent System
// Orchestrates all agents to perform complete brand visibility analysis

import type {
    GEOAnalysisRequest,
    GEOAnalysisResult,
    GeneratedContent,
    ContentRecommendation,
    HistoricalRun
} from './types';

import { generateQueries } from './queryGenerator';
import { simulateAllSearches } from './searchSimulator';
import {
    storeAnalysisResult,
    getPreviousAnalysis,
    generateRunId,
    getLatestAnalysis
} from './memoryStore';
import { calculateVisibilityScore } from './visibilityScorer';
import { generateAlerts, summarizeAlerts } from './alertMonitor';
import { analyzeContentGaps, prioritizeRecommendations } from './contentGapAnalyzer';
import { generateContent, generateMultipleContents } from './contentWriter';

// Export types
export * from './types';

// Export individual agents for direct access
export { generateQueries, expandQueries } from './queryGenerator';
export { simulateAllSearches, simulateSearch } from './searchSimulator';
export {
    storeAnalysisResult,
    getLatestAnalysis,
    getPreviousAnalysis,
    getAnalysisHistory,
    getHistoricalRuns,
    getSimulationsByQuery,
    compareRuns,
    getAllBrands,
    clearHistory,
    generateRunId
} from './memoryStore';
export { calculateVisibilityScore, compareScores } from './visibilityScorer';
export { generateAlerts, summarizeAlerts, formatAlert, groupAlertsByType } from './alertMonitor';
export { analyzeContentGaps, prioritizeRecommendations } from './contentGapAnalyzer';
export { generateContent, generateMultipleContents } from './contentWriter';
export {
    autoPublish,
    publishToWordPress,
    formatContentToHTML,
    previewPublishContent
} from './autoPublisher';
export {
    runRadiusOrchestration,
    formatForHomepage,
    getRadiusQuickStatus,
    extractGEOSnapshot
} from './radiusOrchestrator';

/**
 * Main orchestrator function that runs the complete GEO analysis
 * This coordinates all 7 agents to perform end-to-end brand visibility analysis
 */
export async function runGEOAnalysis(
    request: GEOAnalysisRequest
): Promise<GEOAnalysisResult> {
    const runId = generateRunId();
    const timestamp = new Date();

    console.log(`[GEO] Starting analysis run: ${runId}`);
    console.log(`[GEO] Brand: ${request.brand}, Industry: ${request.industry}`);
    console.log(`[GEO] Competitors: ${request.competitors.join(', ')}`);

    // Step 1: Generate queries (Agent 1)
    console.log('[GEO] Step 1: Generating queries...');
    const queries = await generateQueries(request);
    console.log(`[GEO] Generated ${queries.length} queries`);

    // Step 2: Simulate AI search responses (Agent 2)
    console.log('[GEO] Step 2: Simulating AI search responses...');
    const simulations = await simulateAllSearches(
        queries,
        request.brand,
        request.competitors
    );
    console.log(`[GEO] Completed ${simulations.length} simulations`);

    // Step 3: Calculate visibility score (Agent 4)
    console.log('[GEO] Step 3: Calculating visibility score...');
    const visibilityScore = calculateVisibilityScore(simulations, request.brand);
    console.log(`[GEO] Visibility score: ${visibilityScore.percentage}%`);

    // Step 4: Get previous analysis for comparison (Agent 3)
    const previousAnalysis = getPreviousAnalysis(request.brand);

    // Step 5: Generate alerts (Agent 5)
    console.log('[GEO] Step 4: Checking for alerts...');
    const alerts = generateAlerts(
        { simulations, visibilityScore },
        previousAnalysis,
        request.brand
    );
    console.log(`[GEO] Generated ${alerts.length} alerts`);

    // Step 6: Analyze content gaps (Agent 6)
    console.log('[GEO] Step 5: Analyzing content gaps...');
    const contentRecommendations = prioritizeRecommendations(
        analyzeContentGaps(simulations, request)
    );
    console.log(`[GEO] Generated ${contentRecommendations.length} content recommendations`);

    // Build result
    const result: GEOAnalysisResult = {
        request,
        queries,
        simulations,
        visibilityScore,
        alerts,
        contentRecommendations,
        timestamp,
        runId,
    };

    // Step 7: Store result (Agent 3)
    console.log('[GEO] Step 6: Storing results...');
    storeAnalysisResult(result);

    console.log(`[GEO] Analysis complete. Run ID: ${runId}`);
    console.log(`[GEO] ${summarizeAlerts(alerts)}`);

    return result;
}

/**
 * Generate content for a specific recommendation
 */
export async function generateContentForRecommendation(
    recommendation: ContentRecommendation,
    request: GEOAnalysisRequest
): Promise<GeneratedContent> {
    return generateContent(recommendation, request);
}


/**
 * Quick analysis summary for a brand
 */
export async function getQuickSummary(brand: string): Promise<{
    hasData: boolean;
    latestScore?: number;
    lastRun?: Date;
    alertCount?: number;
    trend?: 'up' | 'down' | 'stable';
}> {
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
        latestScore: latest.visibilityScore.percentage,
        lastRun: latest.timestamp,
        alertCount: latest.alerts.length,
        trend,
    };
}

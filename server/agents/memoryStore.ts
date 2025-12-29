// Agent 3: Storage & Memory Agent
// Stores all results in structured memory for historical comparison

import type {
    GEOAnalysisResult,
    SimulationResult,
    HistoricalRun,
    GEOAnalysisRequest
} from './types';

// In-memory storage (can be extended to database later)
const analysisHistory: Map<string, GEOAnalysisResult[]> = new Map();

export function generateRunId(): string {
    return `run_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

export function storeAnalysisResult(result: GEOAnalysisResult): void {
    const brandKey = normalizeBrandKey(result.request.brand);

    const existing = analysisHistory.get(brandKey) || [];
    existing.push(result);

    // Keep only last 100 runs per brand
    if (existing.length > 100) {
        existing.splice(0, existing.length - 100);
    }

    analysisHistory.set(brandKey, existing);
}

export function getLatestAnalysis(brand: string): GEOAnalysisResult | undefined {
    const brandKey = normalizeBrandKey(brand);
    const history = analysisHistory.get(brandKey);

    if (!history || history.length === 0) {
        return undefined;
    }

    return history[history.length - 1];
}

export function getPreviousAnalysis(brand: string): GEOAnalysisResult | undefined {
    const brandKey = normalizeBrandKey(brand);
    const history = analysisHistory.get(brandKey);

    if (!history || history.length < 2) {
        return undefined;
    }

    return history[history.length - 2];
}

export function getAnalysisHistory(brand: string, limit: number = 10): GEOAnalysisResult[] {
    const brandKey = normalizeBrandKey(brand);
    const history = analysisHistory.get(brandKey) || [];

    return history.slice(-limit).reverse(); // Most recent first
}

export function getHistoricalRuns(brand: string, limit: number = 10): HistoricalRun[] {
    const history = getAnalysisHistory(brand, limit);

    return history.map(result => ({
        runId: result.runId,
        brand: result.request.brand,
        timestamp: result.timestamp,
        visibilityScore: result.visibilityScore.percentage,
        queryCount: result.queries.length,
        alertCount: result.alerts.length,
    }));
}

export function getSimulationsByQuery(
    brand: string,
    query: string
): SimulationResult[] {
    const brandKey = normalizeBrandKey(brand);
    const history = analysisHistory.get(brandKey) || [];

    const results: SimulationResult[] = [];

    for (const run of history) {
        const sim = run.simulations.find(s => s.query === query);
        if (sim) {
            results.push(sim);
        }
    }

    return results;
}

export function compareRuns(
    brand: string,
    runId1: string,
    runId2: string
): { run1: GEOAnalysisResult | undefined; run2: GEOAnalysisResult | undefined } {
    const brandKey = normalizeBrandKey(brand);
    const history = analysisHistory.get(brandKey) || [];

    return {
        run1: history.find(r => r.runId === runId1),
        run2: history.find(r => r.runId === runId2),
    };
}

export function getAllBrands(): string[] {
    return Array.from(analysisHistory.keys());
}

export function clearHistory(brand: string): void {
    const brandKey = normalizeBrandKey(brand);
    analysisHistory.delete(brandKey);
}

function normalizeBrandKey(brand: string): string {
    return brand.toLowerCase().replace(/^www\./, '').replace(/\/$/, '');
}

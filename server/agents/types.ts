// Types and interfaces for the GEO Multi-Agent System

export interface GEOAnalysisRequest {
    brand: string;
    industry: string;
    competitors: string[];
    market?: string; // Default: "India"
    domain?: string;
}

export interface GeneratedQuery {
    query: string;
    intent: 'informational' | 'commercial' | 'comparison';
    category: 'best' | 'versus' | 'for_segment' | 'how_to' | 'what_is';
}

export interface SimulationResult {
    query: string;
    aiResponse: string;
    brandFound: boolean;
    brandPosition: 'top' | 'middle' | 'bottom' | 'absent';
    competitorsFound: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    timestamp: Date;
}

export interface VisibilityScore {
    score: number;
    maxPossibleScore: number;
    percentage: number;
    explanation: string;
    breakdown: {
        brandMentions: number;
        topPositions: number;
        middlePositions: number;
        competitorPenalty: number;
        sentimentPenalty: number;
    };
}

export interface Alert {
    type: 'visibility_drop' | 'competitor_overtake' | 'brand_disappeared';
    severity: 'low' | 'medium' | 'high';
    message: string;
    query: string;
    previousState?: {
        brandPosition: string;
        score: number;
    };
    currentState: {
        brandPosition: string;
        score: number;
    };
    timestamp: Date;
}

export interface ContentRecommendation {
    type: 'blog' | 'comparison_page' | 'faq' | 'landing_page';
    title: string;
    description: string;
    targetQuery: string;
    priority: 'high' | 'medium' | 'low';
    expectedImpact: string;
}

export interface GeneratedContent {
    title: string;
    content: string;
    type: ContentRecommendation['type'];
    metadata: {
        wordCount: number;
        readingTime: string;
        targetKeywords: string[];
    };
}

export interface GEOAnalysisResult {
    request: GEOAnalysisRequest;
    queries: GeneratedQuery[];
    simulations: SimulationResult[];
    visibilityScore: VisibilityScore;
    alerts: Alert[];
    contentRecommendations: ContentRecommendation[];
    timestamp: Date;
    runId: string;
}

export interface HistoricalRun {
    runId: string;
    brand: string;
    timestamp: Date;
    visibilityScore: number;
    queryCount: number;
    alertCount: number;
}

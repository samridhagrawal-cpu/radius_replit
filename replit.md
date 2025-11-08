# Radius - AI Visibility Analyzer

## Overview
Radius is a production-ready SaaS application designed to analyze a brand's visibility across major AI platforms (ChatGPT, Claude, Gemini, and Perplexity). It achieves this by scraping websites, identifying competitors using OpenAI's GPT models and Tracxn data, and generating detailed, actionable insights presented through a modern dashboard with comprehensive metrics documentation, interactive info buttons, competitor discovery methodology, LLM accuracy verification, "Open in AI" testing features, and professional PDF report generation. The project's core purpose is to provide businesses with a clear understanding of how their brand is perceived and recommended by AI, enabling them to enhance their AI presence and competitive standing.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### Frontend Architecture
The frontend is built with React 18 and TypeScript, using Vite for fast development. It leverages `shadcn/ui` for accessible components and Tailwind CSS for styling, adhering to a minimalist black and white design with a blue accent. State management is handled by TanStack Query for server state and local React state for UI interactions. Wouter is used for lightweight client-side routing. The application includes a landing page with a search component, an authentication modal (Login/Signup), and a protected dashboard displaying domain analysis history.

### Backend Architecture
The backend is an Express.js application with TypeScript. It provides RESTful APIs for analysis, authentication, and history management. A service layer orchestrates web scraping (Cheerio), AI integration (OpenAI GPT), and market intelligence (Tracxn). Data is persistently stored in a PostgreSQL database using Drizzle ORM, including user data, sessions, domain history, and analysis results. Session-based authentication with `bcrypt` for password hashing and a custom `DatabaseSessionStore` ensures secure user management.

### AI Integration Architecture
OpenAI's GPT-4o-mini is the primary AI service, used for brand extraction, competitor discovery (enriched by Tracxn API data), platform visibility analysis, dimension scoring, and recommendation generation. The system uses JSON mode with Zod schema validation for GPT responses to ensure structured and type-safe data output.

### Authentication Architecture
Session-based authentication is implemented with PostgreSQL-backed sessions. `bcrypt` handles password hashing, and `express-session` with a custom `DatabaseSessionStore` manages sessions, including HttpOnly cookies and hourly cleanup of expired sessions. Middleware (`requireAuth`, `optionalAuth`) controls access to protected routes and attaches user information to requests.

### Data Schemas
Key data schemas include `User`, `Session`, `DomainHistory`, and `AnalysisResult`, all defined with Zod for runtime validation and type inference, ensuring consistency between frontend and backend.

## External Dependencies
### Core Services
*   **OpenAI API**: Used for all AI-powered analysis, including competitor discovery, scoring, and recommendations. Requires `OPENAI_API_KEY`.
*   **Tracxn API**: Provides real-world competitor and market intelligence data (funding, employees, etc.) to enrich AI analysis. Requires `TRACXN_API_KEY`, with graceful degradation if unavailable.
*   **PostgreSQL (via Neon)**: The primary database for persistent storage of user data, sessions, domain history, and analysis results. Requires `DATABASE_URL`.

### Third-Party Libraries
*   **UI Framework**: `@radix-ui/*`, `recharts`, `lucide-react`.
*   **State & Data**: `@tanstack/react-query`, `zod`, `react-hook-form`.
*   **Utilities**: `cheerio`, `node-fetch`, `clsx`, `tailwind-merge`, `date-fns`.
*   **Development & Backend**: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `bcrypt`, `express-session`.
*   **PDF Generation**: `@react-pdf/renderer`, `jspdf`, `html2canvas`.

## Recent Updates (November 2025)
### AI Analysis Progress Timeline - PRODUCTION READY ✅
Implemented a world-class, minimalist progress timeline providing real-time feedback during the 30-second AI analysis process. The timeline features smooth animations, responsive design, and ensures complete visualization regardless of API response speed.

**Features:**
- 5 sequential steps with exact durations: Querying (6s), Analyzing (7s), Processing (6s), Insights (6s), Finalizing (5s)
- Smooth animations: entry fade-in, active pulse, progress bars, completion checkmarks, exit fade-out
- Responsive design: horizontal layout (desktop), vertical layout (mobile)
- Guaranteed completion: Timeline completes full animation cycle even if API responds quickly
- Clean lifecycle: Proper timer cleanup prevents React warnings and memory leaks
- Accessibility: ARIA attributes, screen reader support, semantic HTML

### Comprehensive GEO Metrics System - PRODUCTION READY ✅
Successfully integrated a complete GEO (Generative Engine Optimization) metrics system with full backend calculations and frontend display. All features are now live in production with real data from the analyzer service.

**Current Status:** ✅ Backend integration complete | ✅ Frontend components active | ✅ E2E tested | ✅ Timeline integrated

1. **Interactive Metrics Documentation**
   - InfoButton component with tooltips and detailed modal explanations for every metric
   - Three main scoring factors: AIC (40%), CES (35%), MTS (25%)
   - MetricCard components with color-coded scoring anchors and info buttons
   - Comprehensive calculation methodology section with sub-metrics breakdown

2. **Competitor Discovery & Comparison**
   - 5-step competitor discovery methodology visualization
   - "The 7 Critical Consumer Questions" framework (Discovery, Comparison, Utility)
   - Comparison dimensions with weighted scoring (Discovery 30%, Comparison 35%, Utility 35%)
   - Interactive competitor comparison tables with head-to-head scoring

3. **"Open in AI" Testing Features**
   - OpenInAIButton component supporting ChatGPT, Claude, Perplexity, and Gemini
   - Pre-configured test queries with brand context
   - One-click testing of brand visibility in live AI platforms

4. **LLM Accuracy Verification**
   - Platform-by-platform accuracy checking with percentage scores
   - Hallucination detection and highlighting
   - Missing information tracking
   - Color-coded accuracy indicators (Green: ≥90%, Yellow: ≥70%, Red: <70%)

5. **Professional PDF Report Generation**
   - Multi-page PDF reports with black/white minimalist design
   - Includes cover page, executive summary, key metrics, platform analysis, competitive landscape, quick wins, strategic bets, and accuracy verification
   - One-click download with proper date formatting
   - Professional layout using `@react-pdf/renderer`

### New Files Added
**Timeline Components:**
*   `client/src/components/AnalysisTimeline.tsx` - Minimalist progress timeline with 5 steps and animations

**GEO Components:**
*   `client/src/lib/geo-types.ts` - Comprehensive TypeScript type definitions for GEO metrics
*   `client/src/lib/geo-constants.ts` - Metric definitions, sub-metrics, discovery steps, consumer questions
*   `client/src/lib/mock-geo-data.ts` - Mock data generator for testing and demonstration
*   `client/src/components/InfoButton.tsx` - Interactive info button with tooltips and modals
*   `client/src/components/MetricCard.tsx` - Score display cards with color-coded progress bars
*   `client/src/components/OpenInAIButton.tsx` - "Test in AI" buttons for live platform testing
*   `client/src/components/CalculationMethodology.tsx` - Detailed methodology explanation with tabs
*   `client/src/components/CompetitorDiscovery.tsx` - Visual competitor discovery methodology
*   `client/src/components/CompetitorComparison.tsx` - Interactive competitor comparison table
*   `client/src/components/AccuracyIndicator.tsx` - LLM accuracy verification display
*   `client/src/components/PDFReport.tsx` - PDF report generation and download

### Backend Implementation Details
**Schema Extensions** (`shared/schema.ts`):
*   Added complete GEO type definitions: `geoMetricsSchema`, `competitorAnalysisSchema`, `accuracyCheckSchema`, `quickWinSchema`, `strategicBetSchema`, `platformScoreDetailSchema`
*   Extended AnalysisResult to include: `geoMetrics`, `competitorAnalysis`, `platformScoreDetails`, `accuracyChecks`, `quickWins`, `strategicBets`
*   All optional fields to maintain backwards compatibility

**Analyzer Service** (`server/services/analyzer.ts`):
*   `calculateGEOMetrics()`: Main GEO score calculation with 40/35/25 weighting
*   `calculateAIC()`: Answerability & Intent Coverage scoring (content depth, FAQ, use cases, documentation)
*   `calculateCES()`: Credibility, Evidence & Safety scoring (testimonials, about page, blog, external links)
*   `calculateMTS()`: Machine-Readability & Technical Signals scoring (meta tags, structured content, internal linking)
*   `generateCompetitorAnalysis()`: Creates comparison metrics with discovery/comparison/utility scores
*   `performAccuracyChecks()`: Platform-by-platform LLM accuracy verification
*   `generateQuickWins()`: Identifies high-impact, low-effort improvements
*   `generateStrategicBets()`: Suggests long-term strategic initiatives
*   `generatePlatformScoreDetails()`: Per-platform breakdown of GEO metrics

**Type Safety**:
*   Frontend `geo-types.ts` aligned with backend `shared/schema.ts` types
*   All type casts removed for compile-time safety
*   Platform names use generic `string` instead of strict literals for flexibility
*   AccuracyCheck uses `string[]` for test_queries instead of complex TestQuery objects

### Current Production Features
*   AnalysisResults component includes 8 tabs: Overview, Recommendations, Score Breakdown, Competitor Analysis, Methodology, Competitor Discovery, Accuracy Check, and Missing Elements
*   All features display real analysis data from the backend with full type safety
*   GEO metrics (AIC, CES, MTS) calculated with proper weighting and displayed with interactive info buttons
*   Professional PDF report generation with real analysis data
*   "Open in AI" buttons for live testing in ChatGPT, Claude, Perplexity, and Gemini
*   No mock or placeholder data in production paths
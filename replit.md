# Radius - AI Visibility Analyzer

## Overview
Radius is a production-ready SaaS application that analyzes a brand's visibility across major AI platforms (ChatGPT, Claude, Gemini, and Perplexity). It scrapes websites, identifies competitors using OpenAI's GPT models and Tracxn data, and generates detailed, actionable insights. These insights are presented through a modern dashboard with comprehensive metrics documentation, interactive features, competitor discovery methodology, LLM accuracy verification, "Open in AI" testing, and professional PDF report generation. The project aims to provide businesses with a clear understanding of their AI presence and competitive standing.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### Frontend Architecture
The frontend uses React 18, TypeScript, and Vite, styled with `shadcn/ui` and Tailwind CSS for a minimalist black and white design with a blue accent. State is managed by TanStack Query for server state and local React state for UI interactions, with Wouter handling client-side routing. It features a landing page with search, an authentication modal, and a protected dashboard for domain analysis history.

### Backend Architecture
The backend is an Express.js application with TypeScript, providing RESTful APIs for analysis, authentication, and history. A service layer orchestrates web scraping (Cheerio), AI integration (OpenAI GPT), and market intelligence (Tracxn). PostgreSQL, with Drizzle ORM, stores user data, sessions, domain history, and analysis results. Session-based authentication uses `bcrypt` for password hashing and a custom `DatabaseSessionStore`.

### AI Integration Architecture
OpenAI's GPT-4o-mini is central for brand extraction, competitor discovery (enriched by Tracxn), platform visibility analysis, dimension scoring, and recommendation generation. JSON mode with Zod schema validation ensures structured and type-safe data output from GPT.

### Authentication Architecture
Session-based authentication uses PostgreSQL-backed sessions, `bcrypt` for password hashing, and `express-session` with a `DatabaseSessionStore` for session management (HttpOnly cookies, hourly cleanup). Middleware (`requireAuth`, `optionalAuth`) controls access and attaches user info to requests.

### Data Schemas
Key data schemas (`User`, `Session`, `DomainHistory`, `AnalysisResult`) are defined with Zod for runtime validation and type inference, ensuring consistency across the application. GEO type definitions (`geoMetricsSchema`, `competitorAnalysisSchema`, `accuracyCheckSchema`, etc.) are extended into `AnalysisResult`.

### UI/UX Decisions
The application features an AI analysis progress bar, a comprehensive GEO (Generative Engine Optimization) metrics system with interactive documentation, "Open in AI" testing features, LLM accuracy verification, and professional PDF report generation with a minimalist black/white design. Recommendations are hyper-personalized based on brand context.

## External Dependencies
### Core Services
*   **OpenAI API**: Used for all AI-powered analysis (competitor discovery, scoring, recommendations).
*   **Tracxn API**: Provides competitor and market intelligence data.
*   **PostgreSQL (via Neon)**: Primary database for persistent storage.

### Third-Party Libraries
*   **UI Framework**: `@radix-ui/*`, `recharts`, `lucide-react`.
*   **State & Data**: `@tanstack/react-query`, `zod`, `react-hook-form`.
*   **Utilities**: `cheerio`, `node-fetch`, `clsx`, `tailwind-merge`, `date-fns`.
*   **Development & Backend**: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `bcrypt`, `express-session`.
*   **PDF Generation**: `@react-pdf/renderer`.

## Recent Updates (November 2025)
### Intelligent Competitor Discovery - PRODUCTION READY ✅
Completely overhauled the competitor discovery system to find REAL, specific niche competitors instead of generic e-commerce platforms. The system now uses advanced prompt engineering and lower temperature settings to deliver accurate, relevant competitor insights.

**Key Improvements:**
- **Temperature Reduction**: Lowered from 0.8 to 0.3 for more precise, factual results
- **Explicit Filtering**: Added strict "DO NOT include" rules for marketplaces, platforms, generic retailers
- **Niche Focus**: Clear instructions to find DIRECT competitors in the SAME specific market segment
- **Real Brand Examples**: For water brand → finds other water brands (NOT Amazon/Flipkart)
- **Tracxn Priority**: When Tracxn API data is available, it's used exclusively with graceful fallback to GPT

**Prompt Engineering Enhancements:**
```
DO NOT include:
- E-commerce marketplaces (Amazon, Flipkart, eBay, Etsy)
- Generic retailers (Walmart, Target)
- Platforms (Shopify stores, marketplaces)
- Payment processors or service providers

DO include:
- Brands that make/sell the SAME type of product
- Direct competitors in the SAME market segment
- Companies with similar target customers
```

**Test Results:**
- Analyzed "neerratna.com" (water brand)
- Found: Patanjali Ayurved, Himalaya Wellness, Organic India, Dabur India
- NO generic platforms (Amazon, Flipkart, Myntra, Snapdeal)
- All competitors are real brands with verified domains

### Enhanced Competitor Card UI - PRODUCTION READY ✅
Redesigned competitor cards for better visual hierarchy, smoother interactions, and improved responsiveness.

**Visual Improvements:**
- **Hover Effects**: Added `hover-elevate` class for smooth transitions
- **"YOU" Badge**: Larger, bolder design (`font-bold`, `px-2.5 py-1`) for current brand
- **Rank Badge**: Increased size (`w-11 h-11`), added border for better definition
- **Typography**: Uppercase section headers with tracking, better font weights
- **Spacing**: Increased gaps (`gap-6` between cards, `gap-x-6` within cards)
- **Visual Hierarchy**: Larger company names (`text-lg`), clearer sections
- **Better Readability**: Improved line spacing, enhanced description borders

**Layout Improvements:**
- Grid breakpoint changed: `lg:grid-cols-2` → `xl:grid-cols-2` for better responsive design
- Increased gap between cards: `gap-4` → `gap-6`
- Better section spacing with improved margins

**Interaction Enhancements:**
- Smooth hover transitions on competitor cards
- Better link hover states with `transition-colors`
- More prominent "YOU" badge for current brand identification
- Clearer rank indicators with border definition

### Professional PDF Report - PRODUCTION READY ✅
Comprehensive 15-20 page whitepaper-quality PDF report with data visualizations, in-depth analysis, and professional design.

**Report Structure:**
1. Professional cover page with branding
2. Dynamic table of contents (conditional sections)
3. Executive summary with score visualization
4. Methodology overview with weight distribution charts
5. Key findings with metric cards and bar charts
6. GEO score breakdown (AIC 40%, CES 35%, MTS 25%)
7. Platform-by-platform analysis
8. Competitive landscape with top 5 competitors
9. Strategic recommendations (Quick Wins + Strategic Bets)
10. LLM accuracy verification
11. Technical appendix with glossary
12. Professional closing page

**Technical Implementation:**
- All styles react-pdf compatible (no CSS shorthand)
- Proper border properties (borderWidth/borderColor/borderStyle)
- Bar charts with View components
- Metric cards with color-coded status badges
- Conditional rendering based on data availability
- Fixed title wrapping on cover page (38pt font, improved spacing)
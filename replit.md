# Radius - AI Visibility Analyzer

## Overview
Radius is a production-ready SaaS application designed to analyze a brand's visibility across major AI platforms (ChatGPT, Claude, Gemini, and Perplexity). It achieves this by scraping websites, identifying competitors using OpenAI's GPT models and Tracxn data, and generating detailed, actionable insights. The application provides a modern dashboard featuring comprehensive metrics, interactive tools, competitor discovery methodologies, LLM accuracy verification, "Open in AI" testing capabilities, and professional PDF report generation. The primary goal is to equip businesses with a clear understanding of their AI presence and competitive landscape.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The Radius platform is built with a robust, scalable architecture. The frontend, developed with React 18, TypeScript, and Vite, uses `shadcn/ui` and Tailwind CSS for a minimalist black and white aesthetic with blue accents. State management is handled by TanStack Query for server state and local React state for UI interactions, with Wouter managing client-side routing. Key UI/UX decisions include an AI analysis progress bar, a comprehensive Generative Engine Optimization (GEO) metrics system with interactive documentation, "Open in AI" testing features, LLM accuracy verification, and professional PDF report generation. Recommendations are hyper-personalized based on brand context.

The backend is an Express.js application, also in TypeScript, providing RESTful APIs for analysis, authentication, and history. It integrates web scraping (Cheerio), AI processing (OpenAI GPT-4o-mini), and market intelligence (Tracxn). OpenAI's GPT-4o-mini is central to various functionalities, including brand extraction, competitor discovery, platform visibility analysis, dimension scoring, and recommendation generation, utilizing JSON mode with Zod for schema validation. PostgreSQL, managed with Drizzle ORM, serves as the primary data store for user information, sessions, domain history, and analysis results. Session-based authentication is implemented using `bcrypt` for password hashing and a custom `DatabaseSessionStore`.

The system incorporates a three-tier error handling system to manage JavaScript-heavy websites, categorized into SEVERE, LIMITED, and WARNING tiers, ensuring cost savings by preventing unnecessary API calls and providing educational user feedback. For JavaScript-dependent sites that return minimal static HTML, the GEO scoring system provides baseline scores instead of zero, offering a more accurate reflection of the site's existence and functionality.

## External Dependencies
### Core Services
*   **OpenAI API**: Utilized for all AI-powered analysis, including competitor discovery, scoring, and recommendations.
*   **Tracxn API**: Provides essential competitor and market intelligence data.
*   **PostgreSQL (via Neon)**: The primary database for persistent data storage.

### Third-Party Libraries
*   **UI Framework**: `@radix-ui/*`, `recharts`, `lucide-react`.
*   **State & Data Management**: `@tanstack/react-query`, `zod`, `react-hook-form`.
*   **Utilities**: `cheerio`, `node-fetch`, `clsx`, `tailwind-merge`, `date-fns`.
*   **Backend & ORM**: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `bcrypt`, `express-session`.
*   **PDF Generation**: `@react-pdf/renderer`.

## Recent Updates (November 2025)

### Premium Video Section - PRODUCTION READY ✅
Premium YouTube video embed section strategically positioned between HeroSection and FeaturesSection, creating an effective user journey flow.

**Design Features:**
- **Strategic Placement**: Positioned between Hero and Features (Hero → Video → Features → Footer)
- **Section Header**: "Watch Radius in 30 Seconds" with badge styling
- **Premium Frame**: Border with hover effect, rounded corners, shadow-xl for depth
- **16:9 Aspect Ratio**: YouTube embed with proper aspect ratio container
- **Stats Section**: 3 stat items with lucide-react icons (Clock, Target, Sparkles)

**Technical Details:**
- Component: `client/src/components/VideoSection.tsx`
- Location: Landing page only, between HeroSection and FeaturesSection
- Video: YouTube embed (9LQ-QDet_4c) with modestbranding and rel=0 parameters
- Typography: text-3xl → text-4xl (md) → text-5xl (lg) for header
- Frame: border-2 border-border, hover:border-foreground with gradient hover effect
- Stats: "2-minute demo", "Real results", "No fluff" with lucide-react icons
- Icons: Clock, Target, Sparkles from lucide-react (no emojis)
- Colors: Semantic tokens (bg-foreground, text-background, text-muted-foreground, border-border)

**Quality Assurance:**
- Architect-approved with PASS verdict
- E2E tested with iframe loading, stats display, and responsive behavior verified
- Design system compliant (semantic tokens, lucide-react icons, no emojis)
- Production-ready with premium styling and proper positioning

### Minimal Faded Footer - PRODUCTION READY ✅
Ultra-minimal footer with massive, faded "Radius" typography creating a premium, watermark-like visual ending to the landing page.

**Design Features:**
- **Faded Typography**: Oversized "Radius" text in subtle gray (text-muted-foreground/20) for watermark effect
- **Responsive Sizing**: Font scales from 100px (mobile) → 160px (tablet) → 200px (desktop) → 240px (XL)
- **Minimal Content**: Only the hero text plus small copyright line
- **Generous Spacing**: py-24 (mobile), py-40 (desktop) for premium feel
- **Centered Layout**: max-w-7xl container with centered alignment

**Technical Details:**
- Component: `client/src/components/Footer.tsx`
- Location: Landing page only, after FeaturesSection
- Typography: font-bold (700), leading-none, tracking-tight, select-none
- Color: Semantic token text-muted-foreground/20 (adapts to dark/light mode)
- Copyright: Small text-sm in text-muted-foreground

**Quality Assurance:**
- Architect-approved with PASS verdict
- E2E tested with responsive sizing verified (240px→160px→100px)
- Design system compliant (semantic tokens, no hardcoded colors)
- Production-ready with subtle, professional appearance

### Premium Features Section - PRODUCTION READY ✅
World-class features section showcasing Radius's four key capabilities with data visualizations and premium animations.

**Features Showcased:**
1. **Visibility**: Line chart visualization showing AI platform performance trends
2. **AI-Generated Recommendations**: 4 actionable insights with HIGH/MED impact badges and point estimates (+8-10 pts)
3. **Competitor Tracking**: Interactive table showing competitor rankings with trend indicators
4. **Download Comprehensive Report**: PDF preview mockup with statistics (20+ Pages, 100+ Insights, 4 Platforms)

**Design Implementation:**
- **Minimal Aesthetic**: Black/white design with semantic color tokens for dark/light mode support
- **Premium Animations**: Smooth fade-in-up entrance with staggered delays (200/400/600/800ms)
- **Data Visualizations**: SVG line charts, recommendation cards with impact badges, PDF preview mockup
- **Interactive Elements**: Hover elevation effects using design system utilities (hover-elevate)
- **Responsive Layout**: 2-column grid on large screens (lg:grid-cols-2), stacks on mobile

**Technical Details:**
- Component: `client/src/components/FeaturesSection.tsx`
- Icons: Lucide-react icons (Target, Lightbulb, BarChart3, CheckCircle, Star, FileText, Download)
- Colors: Semantic tokens only (text-foreground, text-muted-foreground, bg-foreground, bg-card)
- Impact Badges: HIGH (bg-foreground text-background), MED (bg-muted-foreground text-background)

**Quality Assurance:**
- Architect-approved with PASS verdict (fixed text-primary violation)
- E2E tested with all 4 cards, visualizations, and interactions verified
- Full design system compliance (no text-primary except hero, semantic colors throughout)
- Production-ready with smooth animations and premium feel
# GeoPulse - AI Visibility Analyzer

## Overview

GeoPulse is a production-ready SaaS application that analyzes a brand's visibility across AI platforms (ChatGPT, Claude, Gemini, and Perplexity). The system scrapes websites, uses OpenAI's GPT models to discover competitors and generate insights, then presents detailed analytics through a modern dashboard interface.

**Core Value Proposition**: Provide businesses with actionable insights about how AI platforms perceive and recommend their brand compared to competitors.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript and Vite as the build tool

**UI Component System**:
- **shadcn/ui** component library (Radix UI primitives with custom styling)
- **Tailwind CSS** for utility-first styling with custom design tokens
- **Design System**: Minimalist black and white aesthetic with strategic blue accent
- **Color Palette**: Black (#000000) primary, white (#FFFFFF) background, gray (#6B7280) text, blue (#3B82F6) accent
- **Path Aliases**: Configured for clean imports (`@/components`, `@/lib`, `@/hooks`, `@shared`)

**Landing Page Design** (November 2025 Final):
- **Navigation**: Black circular logo icon, plain gray nav links (Features, Pricing, About), "Login" text link, black "Get Started" button
- **Hero Section**: 
  - Badge: "AI-Powered Visibility Analysis" (gray background)
  - Headline: "Increase your visibility across AI platforms" with black liquid glass highlight on "across AI platforms" (white text on glossy black pill background with gradient sheen)
  - Sub-headline: "Discover how ChatGPT, Claude, Gemini, and Perplexity perceive your brand. Get actionable insights to boost your AI presence."
  - Metrics: "500+ analyses run" (with green pulsing dot), "89% avg improvement", "4 AI platforms analyzed"
- **Search Component**: White rounded-full input with "Enter your website URL (e.g., example.com)" placeholder, circular black search icon button positioned inside on the right
- **Helper Text**: "No credit card required • Free comprehensive analysis • Results in 30 seconds"
- **Visual Style**: Clean, minimalist, professional with high contrast and generous whitespace, premium liquid glass effect on key phrase

**State Management**:
- **TanStack Query (React Query)** for server state management and API caching
- Local React state for UI interactions
- Custom query client with configured defaults (no automatic refetching, infinite stale time)

**Routing**: 
- **Wouter** for lightweight client-side routing
- Single-page application with `/` (Home) and 404 routes

**Key Design Decisions**:
- **Rationale**: shadcn/ui chosen for type-safe, accessible components that can be customized and owned by the codebase
- **Alternative**: Material-UI or Chakra UI were considered but shadcn offers better control
- **Pros**: Full component ownership, excellent TypeScript support, accessibility built-in
- **Cons**: Requires more initial setup compared to batteries-included libraries

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**API Design**:
- RESTful endpoints under `/api` prefix
- Single primary endpoint: `POST /api/analyze` - accepts URL, returns complete analysis
- Middleware for JSON parsing, request logging, and response tracking

**Service Layer Architecture**:
```
routes.ts → analyzer.ts → {
  scraper.ts (cheerio-based web scraping)
  openai.ts (GPT API wrapper)
  tracxn.ts (market intelligence API)
}
```

**Storage Strategy**:
- In-memory storage implementation (MemStorage class)
- Interface-based design (IStorage) allows easy swap to database
- Caching layer: Analysis results cached by URL to avoid redundant OpenAI API calls

**Key Design Decisions**:
- **Problem**: Expensive AI API calls and slow analysis times
- **Solution**: In-memory caching of analysis results by URL
- **Rationale**: Most URLs won't change frequently; cache invalidation can be added later
- **Pros**: Instant responses for repeated analyses, reduced API costs
- **Cons**: Cache lost on server restart, no persistence across deployments

### AI Integration Architecture

**Primary AI Service**: OpenAI GPT-4o-mini via official SDK

**AI Workflow**:
1. **Website Scraping**: Cheerio extracts content, metadata, and page structure
2. **Brand Extraction**: GPT analyzes scraped content to identify brand name, industry, description
3. **Competitor Discovery**: 
   - Tracxn API fetches real market competitors with funding, employee count, and company data
   - GPT enriches Tracxn data with competitive analysis and strengths
   - Fallback to GPT-only discovery if Tracxn API is unavailable
4. **Platform Visibility Analysis**: GPT simulates how each AI platform would rank/mention the brand
5. **Dimension Scoring**: GPT evaluates across 6 dimensions (mention rate, context quality, sentiment, etc.)
6. **Recommendations Generation**: GPT provides actionable improvement suggestions

**OpenAI Integration Pattern**:
```typescript
chat(messages: ChatMessage[], options) → Promise<string>
analyzeWithGPT(prompt, { systemPrompt?, jsonMode?, temperature? })
```

**Key Design Decisions**:
- **Problem**: Need structured data from AI responses
- **Solution**: JSON mode for GPT responses with Zod schema validation
- **Rationale**: Ensures type safety and predictable data structures
- **Pros**: Type-safe responses, automatic validation, clear contracts
- **Cons**: Requires careful prompt engineering for consistent JSON output

### Data Schemas

**Primary Data Model** (`AnalysisResult`):
```typescript
{
  url: string
  brandInfo: { name, domain, industry?, description? }
  overallScore: number (0-100)
  platformScores: Array<{ platform, score, color }>
  dimensionScores: Array<{ dimension, score, fullMark }>
  competitors: Array<{ rank, name, domain, score, marketOverlap, strengths, isCurrentBrand?, funding?, employees?, founded?, description? }>
  gaps: Array<{ element, impact, found }>
  recommendations: Array<{ title, description, priority, category, actionItems, estimatedImpact }>
}
```

**Schema Validation**: Zod schemas in `shared/schema.ts` for runtime type checking

### Development Tooling

**Build System**:
- **Vite** for frontend with React plugin
- **esbuild** for backend bundling
- **TypeScript** strict mode enabled across entire codebase

**Dev Experience**:
- Replit-specific plugins: runtime error overlay, cartographer, dev banner
- Hot module replacement for instant feedback
- Shared types between frontend/backend via `shared/` directory

**Database Preparation** (not yet implemented):
- Drizzle ORM configured for PostgreSQL
- Schema defined in `shared/schema.ts` (users table ready)
- Migration tooling set up via drizzle-kit
- Connection via Neon serverless driver

**Key Design Decisions**:
- **Problem**: Type safety between frontend and backend
- **Solution**: Shared schema directory with Zod schemas
- **Rationale**: Single source of truth for data structures
- **Pros**: Full type safety, runtime validation, no drift between client/server
- **Cons**: Requires careful organization to avoid circular dependencies

## External Dependencies

### Core Services

**OpenAI API**:
- **Purpose**: All AI-powered analysis (competitor discovery, scoring, recommendations)
- **Authentication**: API key via `OPENAI_API_KEY` environment variable
- **Model**: GPT-4o-mini for cost-effectiveness
- **Critical**: System cannot function without valid API key

**Tracxn API**:
- **Purpose**: Real-world competitor and market intelligence data
- **Authentication**: API key via `TRACXN_API_KEY` environment variable
- **Provides**: Company funding, employee counts, founding years, descriptions, competitive landscape
- **Graceful Degradation**: System falls back to GPT-only analysis if Tracxn is unavailable
- **Integration**: Enriches competitor discovery with real market data

### Third-Party Libraries

**UI Framework**:
- `@radix-ui/*` (20+ packages): Unstyled, accessible component primitives
- `recharts`: Data visualization for charts and graphs
- `lucide-react`: Icon system

**State & Data**:
- `@tanstack/react-query`: Server state management and caching
- `zod`: Schema validation and TypeScript type inference
- `react-hook-form` + `@hookform/resolvers`: Form state management

**Utilities**:
- `cheerio`: Server-side HTML parsing for web scraping
- `node-fetch`: HTTP client for web scraping
- `clsx` + `tailwind-merge`: Conditional CSS class handling
- `date-fns`: Date manipulation and formatting

**Development**:
- `drizzle-orm` + `drizzle-kit`: ORM and migration tooling (prepared for future use)
- `@neondatabase/serverless`: PostgreSQL driver (prepared for future use)

### Database (Prepared, Not Active)

**PostgreSQL** via Neon:
- Connection string expected in `DATABASE_URL` environment variable
- Schema managed by Drizzle ORM
- Session storage infrastructure prepared (`connect-pg-simple`)
- Currently using in-memory storage; database integration ready for activation

### Design Assets

**Google Fonts**: Inter font family for consistent typography
**Color System**: HSL-based custom properties for theming support
**Icons**: Lucide React icon set

### Environment Variables Required

```
OPENAI_API_KEY=<required>
TRACXN_API_KEY=<optional, enhances competitor data with market intelligence>
DATABASE_URL=<optional, for future database integration>
```
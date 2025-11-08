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
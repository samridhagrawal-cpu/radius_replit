# Radius - AI Visibility Analyzer

## Overview
Radius is a production-ready SaaS application designed to analyze a brand's visibility across major AI platforms (ChatGPT, Claude, Gemini, and Perplexity). It achieves this by scraping websites, identifying competitors using OpenAI's GPT models and Tracxn data, and generating detailed, actionable insights presented through a modern dashboard. The project's core purpose is to provide businesses with a clear understanding of how their brand is perceived and recommended by AI, enabling them to enhance their AI presence and competitive standing.

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
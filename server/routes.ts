import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeWebsite } from "./services/analyzer";
import { analysisResultSchema } from "@shared/schema";
import authRoutes from "./routes/auth";
import historyRoutes from "./routes/history";
import { optionalAuth, type AuthenticatedRequest } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {

  // Register auth routes
  app.use("/api/auth", authRoutes);
  app.use("/api/history", historyRoutes);

  // POST /api/generate-brief - Generate AI brief for analysis results
  app.post("/api/generate-brief", optionalAuth, async (req, res) => {
    try {
      const { z } = await import('zod');

      // Validate request body
      const requestSchema = z.object({
        overallScore: z.number().min(0).max(100),
        platformScores: z.array(z.object({
          platform: z.enum(['ChatGPT', 'Claude', 'Gemini', 'Perplexity']),
          score: z.number().min(0).max(100),
        })).min(1).max(10),
        brandName: z.string().min(1).max(200),
        domain: z.string().min(1).max(200),
      });

      const validatedData = requestSchema.parse(req.body);
      const { overallScore, platformScores, brandName, domain } = validatedData;

      // Sanitize inputs (remove newlines, control characters)
      const sanitizedBrandName = brandName.replace(/[\n\r\t]/g, ' ').trim();
      const sanitizedDomain = domain.replace(/[\n\r\t]/g, ' ').trim();

      const { OpenAI } = await import('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Compute strongest and weakest platforms server-side
      const sortedPlatforms = [...platformScores].sort((a, b) => b.score - a.score);
      const strongest = sortedPlatforms[0];
      const weakest = sortedPlatforms[sortedPlatforms.length - 1];

      const platformDetails = platformScores.map(p =>
        `${p.platform}: ${p.score}/100`
      ).join(', ');

      // Build prompt with computed data to prevent prompt injection
      const prompt = `You are an AI visibility expert. Generate a concise, professional brief (2-3 sentences) analyzing the brand's AI platform performance.

Brand: ${sanitizedBrandName}
Domain: ${sanitizedDomain}
Overall Score: ${overallScore}/100
Platform Scores: ${platformDetails}
Strongest Platform: ${strongest.platform} (${strongest.score}/100)
Weakest Platform: ${weakest.platform} (${weakest.score}/100)

Generate a brief that:
- Highlights the overall performance level (strong if >70, moderate if 50-70, developing if <50)
- Mentions the strongest and weakest platforms by name
- Provides one actionable insight

Keep it professional and data-driven. Use only the data provided above. Do not make assumptions.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an AI visibility analysis expert. Provide clear, factual insights based only on the data provided." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const brief = completion.choices[0]?.message?.content || "Unable to generate brief at this time.";

      res.json({ brief });
    } catch (error) {
      console.error('Brief generation error:', error);

      // Handle validation errors specifically
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Invalid request data',
          details: error.message
        });
      }

      res.status(500).json({
        error: 'Failed to generate brief',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/analyze - Analyze a website URL
  app.post("/api/analyze", optionalAuth, async (req, res) => {
    try {
      let { url } = req.body;
      const userId = (req as AuthenticatedRequest).userId;

      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' });
      }

      // Normalize URL: add https:// if no protocol is present
      if (!url.match(/^https?:\/\//i)) {
        url = 'https://' + url;
      }

      // Extract normalized URL for caching (remove protocol, trailing slash, www)
      const normalizedUrl = url
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .replace(/\/$/, '')
        .toLowerCase();

      // For authenticated users, check 24h cache
      if (userId) {
        const recentAnalysis = await storage.getRecentAnalysis(userId, normalizedUrl);
        if (recentAnalysis) {
          console.log('Returning cached analysis (< 24h) for user:', userId, normalizedUrl);
          return res.json(recentAnalysis);
        }
      }

      // Perform analysis
      console.log('Starting new analysis for:', url);
      const result = await analyzeWebsite(url);

      // Validate the result
      const validated = analysisResultSchema.parse(result);

      // Update competitor scores with the brand's score
      const brandCompetitor = validated.competitors.find(c => c.isCurrentBrand);
      if (brandCompetitor) {
        brandCompetitor.score = validated.overallScore;
      }

      // For authenticated users, save to domain history
      if (userId) {
        const historyEntry = await storage.saveDomainHistory({
          userId,
          domain: validated.brandInfo.domain || normalizedUrl,
          normalizedUrl,
          aiVisibilityScore: validated.overallScore,
          status: 'completed',
        });

        await storage.saveAnalysisResult({
          domainHistoryId: historyEntry.id,
          analysisData: validated,
        });

        console.log('Saved analysis to domain history for user:', userId);
      }

      res.json(validated);
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({
        error: 'Failed to analyze website',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ==================== GEO Multi-Agent System Routes ====================

  // POST /api/geo/analyze - Run complete GEO analysis
  app.post("/api/geo/analyze", optionalAuth, async (req, res) => {
    try {
      const { z } = await import('zod');
      const { runGEOAnalysis } = await import('./agents');

      // Validate request body
      const requestSchema = z.object({
        brand: z.string().min(1).max(200),
        industry: z.string().min(1).max(200),
        competitors: z.array(z.string()).min(1).max(10),
        market: z.string().optional().default('India'),
        domain: z.string().optional(),
      });

      const validatedData = requestSchema.parse(req.body);

      console.log(`[GEO API] Starting analysis for brand: ${validatedData.brand}`);

      const result = await runGEOAnalysis(validatedData);

      res.json({
        success: true,
        data: result,
        summary: {
          runId: result.runId,
          queriesGenerated: result.queries.length,
          simulationsCompleted: result.simulations.length,
          visibilityScore: result.visibilityScore.percentage,
          alertCount: result.alerts.length,
          recommendationCount: result.contentRecommendations.length,
        },
      });
    } catch (error) {
      console.error('GEO Analysis error:', error);

      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to run GEO analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/geo/history/:brand - Get historical analysis runs
  app.get("/api/geo/history/:brand", optionalAuth, async (req, res) => {
    try {
      const { getHistoricalRuns, getLatestAnalysis } = await import('./agents');

      const { brand } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      const history = getHistoricalRuns(brand, limit);
      const latest = getLatestAnalysis(brand);

      res.json({
        success: true,
        brand,
        runs: history,
        latestRun: latest ? {
          runId: latest.runId,
          timestamp: latest.timestamp,
          visibilityScore: latest.visibilityScore,
          alertCount: latest.alerts.length,
        } : null,
      });
    } catch (error) {
      console.error('GEO History error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get history',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/geo/generate-content - Generate AI-optimized content
  app.post("/api/geo/generate-content", optionalAuth, async (req, res) => {
    try {
      const { z } = await import('zod');
      const { generateContentForRecommendation } = await import('./agents');

      const requestSchema = z.object({
        recommendation: z.object({
          type: z.enum(['blog', 'comparison_page', 'faq', 'landing_page']),
          title: z.string(),
          description: z.string(),
          targetQuery: z.string(),
          priority: z.enum(['high', 'medium', 'low']),
          expectedImpact: z.string(),
        }),
        request: z.object({
          brand: z.string(),
          industry: z.string(),
          competitors: z.array(z.string()),
          market: z.string().optional().default('India'),
        }),
      });

      const validatedData = requestSchema.parse(req.body);

      const content = await generateContentForRecommendation(
        validatedData.recommendation,
        validatedData.request
      );

      res.json({
        success: true,
        content,
      });
    } catch (error) {
      console.error('Content generation error:', error);

      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/geo/summary/:brand - Get quick summary
  app.get("/api/geo/summary/:brand", optionalAuth, async (req, res) => {
    try {
      const { getQuickSummary } = await import('./agents');

      const { brand } = req.params;
      const summary = await getQuickSummary(brand);

      res.json({
        success: true,
        brand,
        summary,
      });
    } catch (error) {
      console.error('GEO Summary error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/geo/expand-queries - Expand query list
  app.post("/api/geo/expand-queries", optionalAuth, async (req, res) => {
    try {
      const { z } = await import('zod');
      const { expandQueries } = await import('./agents');

      const requestSchema = z.object({
        brand: z.string().min(1),
        industry: z.string().min(1),
        competitors: z.array(z.string()).min(1),
        market: z.string().optional().default('India'),
        existingQueries: z.array(z.string()).optional().default([]),
      });

      const validatedData = requestSchema.parse(req.body);

      const result = await expandQueries(
        {
          brand: validatedData.brand,
          industry: validatedData.industry,
          competitors: validatedData.competitors,
          market: validatedData.market,
        },
        validatedData.existingQueries
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Query expansion error:', error);

      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to expand queries',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/geo/auto-publish - Auto-publish content to CMS
  app.post("/api/geo/auto-publish", optionalAuth, async (req, res) => {
    try {
      const { z } = await import('zod');
      const { autoPublish } = await import('./agents');

      const requestSchema = z.object({
        cmsType: z.enum(['wordpress']),
        publishMode: z.enum(['draft', 'publish']),
        targetQuery: z.string().min(1),
        brand: z.string().min(1),
        content: z.object({
          definition: z.string(),
          decisionFramework: z.array(z.string()),
          brandPositioning: z.string(),
          competitorContext: z.string(),
          faqs: z.array(z.object({
            question: z.string(),
            answer: z.string(),
          })),
          aiSummary: z.array(z.string()),
        }),
        credentials: z.object({
          siteUrl: z.string().url(),
          username: z.string(),
          applicationPassword: z.string(),
        }).optional(),
      });

      const validatedData = requestSchema.parse(req.body);

      const result = await autoPublish(validatedData);

      res.json(result);
    } catch (error) {
      console.error('Auto-publish error:', error);

      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          status: 'failed',
          reason: 'Invalid request data: ' + error.message
        });
      }

      res.status(500).json({
        status: 'failed',
        reason: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/geo/preview-publish - Preview content without publishing
  app.post("/api/geo/preview-publish", optionalAuth, async (req, res) => {
    try {
      const { z } = await import('zod');
      const { previewPublishContent } = await import('./agents');

      const requestSchema = z.object({
        targetQuery: z.string().min(1),
        brand: z.string().min(1),
        content: z.object({
          definition: z.string(),
          decisionFramework: z.array(z.string()),
          brandPositioning: z.string(),
          competitorContext: z.string(),
          faqs: z.array(z.object({
            question: z.string(),
            answer: z.string(),
          })),
          aiSummary: z.array(z.string()),
        }),
      });

      const validatedData = requestSchema.parse(req.body);

      const preview = previewPublishContent(
        validatedData.content,
        validatedData.targetQuery,
        validatedData.brand
      );

      res.json({
        success: true,
        preview,
      });
    } catch (error) {
      console.error('Preview error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate preview',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ==================== RADIUS ORCHESTRATOR ROUTES ====================

  // POST /api/radius/run - Run full Radius orchestration
  app.post("/api/radius/run", optionalAuth, async (req, res) => {
    try {
      const { z } = await import('zod');
      const { runRadiusOrchestration } = await import('./agents');

      const requestSchema = z.object({
        brand: z.string().min(1),
        industry: z.string().min(1),
        competitors: z.array(z.string()).min(1).max(5),
        market: z.string().optional().default('India'),
        options: z.object({
          mode: z.enum(['full', 'demo']).optional().default('demo'),
          generateContent: z.boolean().optional().default(false),
          autoPublish: z.boolean().optional().default(false),
          cmsCredentials: z.object({
            siteUrl: z.string().url(),
            username: z.string(),
            applicationPassword: z.string(),
          }).optional(),
        }).optional().default({}),
      });

      const validatedData = requestSchema.parse(req.body);

      console.log(`[Radius API] Starting orchestration for: ${validatedData.brand}`);

      const result = await runRadiusOrchestration(
        {
          brand: validatedData.brand,
          industry: validatedData.industry,
          competitors: validatedData.competitors,
          market: validatedData.market,
        },
        validatedData.options
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Radius orchestration error:', error);

      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to run Radius orchestration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/radius/demo - Run homepage demo mode (simplified output)
  app.post("/api/radius/demo", optionalAuth, async (req, res) => {
    try {
      const { z } = await import('zod');
      const { runRadiusOrchestration, formatForHomepage } = await import('./agents');

      const requestSchema = z.object({
        brand: z.string().min(1),
        industry: z.string().min(1),
        competitors: z.array(z.string()).min(1).max(5),
        market: z.string().optional().default('India'),
      });

      const validatedData = requestSchema.parse(req.body);

      console.log(`[Radius Demo] Starting demo for: ${validatedData.brand}`);

      const result = await runRadiusOrchestration(validatedData, { mode: 'demo' });
      const homepage = formatForHomepage(result);

      res.json({
        success: true,
        demo: homepage,
        fullData: result,
      });
    } catch (error) {
      console.error('Radius demo error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to run demo',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/radius/status/:brand - Get quick status for dashboard
  app.get("/api/radius/status/:brand", optionalAuth, async (req, res) => {
    try {
      const { getRadiusQuickStatus } = await import('./agents');

      const { brand } = req.params;
      const status = getRadiusQuickStatus(brand);

      res.json({
        success: true,
        brand,
        status,
      });
    } catch (error) {
      console.error('Radius status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/radius/snapshot - Run and return ONLY GEO_SNAPSHOT (clean JSON)
  app.post("/api/radius/snapshot", optionalAuth, async (req, res) => {
    try {
      const { z } = await import('zod');
      const { runRadiusOrchestration, extractGEOSnapshot } = await import('./agents');

      const requestSchema = z.object({
        brand: z.string().min(1),
        industry: z.string().min(1),
        competitors: z.array(z.string()).min(1).max(5),
        market: z.string().optional().default('India'),
        generateContent: z.boolean().optional().default(false),
      });

      const validatedData = requestSchema.parse(req.body);

      const result = await runRadiusOrchestration(
        {
          brand: validatedData.brand,
          industry: validatedData.industry,
          competitors: validatedData.competitors,
          market: validatedData.market,
        },
        {
          mode: 'full',
          generateContent: validatedData.generateContent
        }
      );

      // Extract and return ONLY the GEO_SNAPSHOT
      const GEO_SNAPSHOT = extractGEOSnapshot(result);

      res.json(GEO_SNAPSHOT);
    } catch (error) {
      console.error('GEO_SNAPSHOT error:', error);
      res.status(500).json({
        error: 'Failed to generate GEO_SNAPSHOT',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

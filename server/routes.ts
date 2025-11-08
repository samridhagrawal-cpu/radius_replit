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

  const httpServer = createServer(app);

  return httpServer;
}

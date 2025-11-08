import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
}, (table) => ({
  expireIdx: index("sessions_expire_idx").on(table.expire),
}));

export const domainHistory = pgTable("domain_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  domain: text("domain").notNull(),
  normalizedUrl: text("normalized_url").notNull(),
  analyzedAt: timestamp("analyzed_at").notNull().defaultNow(),
  aiVisibilityScore: integer("ai_visibility_score").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("completed"),
}, (table) => ({
  userDomainsIdx: index("domain_history_user_domains_idx").on(table.userId, table.analyzedAt),
  userUrlCacheIdx: index("domain_history_user_url_cache_idx").on(table.userId, table.normalizedUrl, table.analyzedAt),
}));

export const insertDomainHistorySchema = createInsertSchema(domainHistory).omit({
  id: true,
  analyzedAt: true,
});

export type InsertDomainHistory = z.infer<typeof insertDomainHistorySchema>;
export type DomainHistory = typeof domainHistory.$inferSelect;

export const analysisResults = pgTable("analysis_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domainHistoryId: varchar("domain_history_id").notNull().references(() => domainHistory.id, { onDelete: "cascade" }),
  analysisData: jsonb("analysis_data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).omit({
  id: true,
  createdAt: true,
});

export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
export type AnalysisResultRow = typeof analysisResults.$inferSelect;

// GEO Metrics Schemas
export const geoMetricsSchema = z.object({
  aic: z.number().min(0).max(10),
  ces: z.number().min(0).max(10),
  mts: z.number().min(0).max(10),
  overall: z.number().min(0).max(10),
});

export const competitorAnalysisSchema = z.object({
  name: z.string(),
  url: z.string(),
  discovery_score: z.number().min(0).max(10),
  comparison_score: z.number().min(0).max(10),
  utility_score: z.number().min(0).max(10),
  overall_geo_score: z.number().min(0).max(10),
  mention_frequency: z.number().min(0).max(100),
  citation_rate: z.number().min(0).max(100),
  head_to_head_wins: z.number().min(0).max(100),
  key_differentiators: z.array(z.string()),
});

export const hallucinationSchema = z.object({
  claim: z.string(),
  reason: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
});

export const accuracyCheckSchema = z.object({
  platform: z.string(),
  test_queries: z.array(z.string()),
  overall_accuracy: z.number().min(0).max(100),
  hallucinations: z.array(hallucinationSchema),
  missing_info: z.array(z.string()),
  correct_facts: z.array(z.string()),
});

export const quickWinSchema = z.object({
  title: z.string(),
  description: z.string(),
  impact: z.enum(['low', 'medium', 'high']),
  effort: z.enum(['low', 'medium', 'high']),
  owner: z.string(),
  expected_outcome: z.string(),
});

export const strategicBetSchema = z.object({
  title: z.string(),
  description: z.string(),
  impact: z.enum(['low', 'medium', 'high']),
  effort: z.enum(['low', 'medium', 'high']),
  owner: z.string(),
  timeline: z.string().optional(),
  expected_outcome: z.string(),
});

export const scrapingQualitySchema = z.object({
  severity: z.enum(['severe', 'limited', 'warning', 'optimal']),
  reason: z.string(),
  recommendation: z.string(),
  technicalDetails: z.object({
    contentLength: z.number(),
    hasTitle: z.boolean(),
    headingCount: z.number(),
    estimatedJSCoverage: z.number(),
  }),
  suggestions: z.array(z.string()),
});

export const analysisErrorSchema = z.object({
  type: z.literal('JAVASCRIPT_HEAVY_SITE'),
  severity: z.enum(['severe']),
  message: z.string(),
  technicalDetails: z.object({
    contentLength: z.number(),
    hasTitle: z.boolean(),
    headingCount: z.number(),
    estimatedJSCoverage: z.number(),
  }),
  suggestions: z.array(z.string()),
});

export const platformScoreDetailSchema = z.object({
  platform: z.string(),
  aic_score: z.number().min(0).max(10),
  ces_score: z.number().min(0).max(10),
  mts_score: z.number().min(0).max(10),
  overall_score: z.number().min(0).max(10),
  analysis: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
});

// Analysis Result Schema
export const analysisResultSchema = z.object({
  url: z.string().url(),
  brandInfo: z.object({
    name: z.string(),
    domain: z.string(),
    industry: z.string().optional(),
    description: z.string().optional(),
  }),
  overallScore: z.number().min(0).max(100),
  platformScores: z.array(z.object({
    platform: z.string(),
    score: z.number().min(0).max(100),
    color: z.string(),
  })),
  dimensionScores: z.array(z.object({
    dimension: z.string(),
    score: z.number().min(0).max(100),
    fullMark: z.number(),
  })),
  competitors: z.array(z.object({
    rank: z.number(),
    name: z.string(),
    domain: z.string(),
    score: z.number().min(0).max(100),
    marketOverlap: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    isCurrentBrand: z.boolean().optional(),
    funding: z.number().optional(),
    employees: z.number().optional(),
    founded: z.number().optional(),
    description: z.string().optional(),
  })),
  gaps: z.array(z.object({
    element: z.string(),
    impact: z.enum(['high', 'medium', 'low']),
    found: z.boolean(),
  })),
  recommendations: z.array(z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    category: z.enum(['content', 'technical', 'seo', 'competitive']),
    actionItems: z.array(z.string()),
    estimatedImpact: z.string(),
  })),
  // GEO Features
  geoMetrics: geoMetricsSchema.optional(),
  competitorAnalysis: z.array(competitorAnalysisSchema).optional(),
  platformScoreDetails: z.array(platformScoreDetailSchema).optional(),
  accuracyChecks: z.array(accuracyCheckSchema).optional(),
  quickWins: z.array(quickWinSchema).optional(),
  strategicBets: z.array(strategicBetSchema).optional(),
  // Error handling
  error: analysisErrorSchema.optional(),
  qualityWarning: scrapingQualitySchema.optional(),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type GEOMetrics = z.infer<typeof geoMetricsSchema>;
export type CompetitorAnalysis = z.infer<typeof competitorAnalysisSchema>;
export type AccuracyCheck = z.infer<typeof accuracyCheckSchema>;
export type QuickWin = z.infer<typeof quickWinSchema>;
export type StrategicBet = z.infer<typeof strategicBetSchema>;
export type PlatformScoreDetail = z.infer<typeof platformScoreDetailSchema>;
export type ScrapingQuality = z.infer<typeof scrapingQualitySchema>;
export type AnalysisError = z.infer<typeof analysisErrorSchema>;

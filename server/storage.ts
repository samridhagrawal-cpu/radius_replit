import {
  type User,
  type InsertUser,
  type DomainHistory,
  type InsertDomainHistory,
  type AnalysisResult,
  type AnalysisResultRow,
  type InsertAnalysisResult,
  users,
  sessions,
  domainHistory,
  analysisResults,
  analysisResultSchema,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, ilike, lt } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Session methods (for express-session integration)
  getSession(sid: string): Promise<any | undefined>;
  saveSession(sid: string, session: any, expiresAt: Date): Promise<void>;
  deleteSession(sid: string): Promise<void>;
  clearExpiredSessions(): Promise<void>;

  // Domain history methods
  saveDomainHistory(historyData: InsertDomainHistory): Promise<DomainHistory>;
  saveAnalysisResult(resultData: InsertAnalysisResult): Promise<AnalysisResultRow>;
  getHistoryEntry(historyId: string): Promise<DomainHistory | undefined>;
  getUserDomainHistory(userId: string, limit?: number, offset?: number): Promise<DomainHistory[]>;
  searchDomainHistory(userId: string, searchTerm: string): Promise<DomainHistory[]>;

  // Analysis cache methods (24h check)
  getRecentAnalysis(userId: string, normalizedUrl: string): Promise<AnalysisResult | undefined>;
  getAnalysisResultByHistoryId(historyId: string): Promise<AnalysisResult | undefined>;
}

// In-memory storage for local development without database
export class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private usersByEmail: Map<string, User> = new Map();
  private sessions: Map<string, { sess: any; expire: Date }> = new Map();
  private domainHistory: Map<string, DomainHistory> = new Map();
  private analysisResults: Map<string, AnalysisResultRow> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.usersByEmail.get(email.toLowerCase());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      name: insertUser.name,
      email: insertUser.email,
      password: insertUser.password,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email.toLowerCase(), user);
    return user;
  }

  async getSession(sid: string): Promise<any | undefined> {
    const session = this.sessions.get(sid);
    if (session && session.expire > new Date()) {
      return session.sess;
    }
    return undefined;
  }

  async saveSession(sid: string, session: any, expiresAt: Date): Promise<void> {
    this.sessions.set(sid, { sess: session, expire: expiresAt });
  }

  async deleteSession(sid: string): Promise<void> {
    this.sessions.delete(sid);
  }

  async clearExpiredSessions(): Promise<void> {
    const now = new Date();
    const sidsToDelete: string[] = [];
    this.sessions.forEach((session, sid) => {
      if (session.expire < now) {
        sidsToDelete.push(sid);
      }
    });
    sidsToDelete.forEach(sid => this.sessions.delete(sid));
  }

  async saveDomainHistory(historyData: InsertDomainHistory): Promise<DomainHistory> {
    const entry: DomainHistory = {
      id: crypto.randomUUID(),
      userId: historyData.userId,
      domain: historyData.domain,
      normalizedUrl: historyData.normalizedUrl,
      aiVisibilityScore: historyData.aiVisibilityScore,
      status: historyData.status ?? 'completed',
      analyzedAt: new Date(),
    };
    this.domainHistory.set(entry.id, entry);
    return entry;
  }

  async saveAnalysisResult(resultData: InsertAnalysisResult): Promise<AnalysisResultRow> {
    const result: AnalysisResultRow = {
      id: crypto.randomUUID(),
      domainHistoryId: resultData.domainHistoryId,
      analysisData: resultData.analysisData,
      createdAt: new Date(),
    };
    this.analysisResults.set(result.id, result);
    return result;
  }

  async getHistoryEntry(historyId: string): Promise<DomainHistory | undefined> {
    return this.domainHistory.get(historyId);
  }

  async getUserDomainHistory(userId: string, limit: number = 20, offset: number = 0): Promise<DomainHistory[]> {
    const userHistory = Array.from(this.domainHistory.values())
      .filter(h => h.userId === userId)
      .sort((a, b) => b.analyzedAt.getTime() - a.analyzedAt.getTime());
    return userHistory.slice(offset, offset + limit);
  }

  async searchDomainHistory(userId: string, searchTerm: string): Promise<DomainHistory[]> {
    const lower = searchTerm.toLowerCase();
    return Array.from(this.domainHistory.values())
      .filter(h => h.userId === userId && h.domain.toLowerCase().includes(lower))
      .sort((a, b) => b.analyzedAt.getTime() - a.analyzedAt.getTime())
      .slice(0, 10);
  }

  async getRecentAnalysis(userId: string, normalizedUrl: string): Promise<AnalysisResult | undefined> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentHistory = Array.from(this.domainHistory.values())
      .filter(h =>
        h.userId === userId &&
        h.normalizedUrl === normalizedUrl &&
        h.analyzedAt >= twentyFourHoursAgo
      )
      .sort((a, b) => b.analyzedAt.getTime() - a.analyzedAt.getTime())[0];

    if (!recentHistory) {
      return undefined;
    }
    return this.getAnalysisResultByHistoryId(recentHistory.id);
  }

  async getAnalysisResultByHistoryId(historyId: string): Promise<AnalysisResult | undefined> {
    const result = Array.from(this.analysisResults.values())
      .find(r => r.domainHistoryId === historyId);

    if (!result) {
      return undefined;
    }

    const parsed = analysisResultSchema.safeParse(result.analysisData);
    if (!parsed.success) {
      console.error('Failed to parse analysis data:', parsed.error);
      return undefined;
    }
    return parsed.data;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db!.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db!.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db!.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getSession(sid: string): Promise<any | undefined> {
    const result = await db!.select().from(sessions).where(eq(sessions.sid, sid)).limit(1);
    return result[0]?.sess;
  }

  async saveSession(sid: string, session: any, expiresAt: Date): Promise<void> {
    await db!
      .insert(sessions)
      .values({ sid, sess: session, expire: expiresAt })
      .onConflictDoUpdate({
        target: sessions.sid,
        set: { sess: session, expire: expiresAt },
      });
  }

  async deleteSession(sid: string): Promise<void> {
    await db!.delete(sessions).where(eq(sessions.sid, sid));
  }

  async clearExpiredSessions(): Promise<void> {
    await db!.delete(sessions).where(lt(sessions.expire, new Date()));
  }

  async saveDomainHistory(historyData: InsertDomainHistory): Promise<DomainHistory> {
    const result = await db!.insert(domainHistory).values(historyData).returning();
    return result[0];
  }

  async saveAnalysisResult(resultData: InsertAnalysisResult): Promise<AnalysisResultRow> {
    const result = await db!.insert(analysisResults).values(resultData).returning();
    return result[0];
  }

  async getHistoryEntry(historyId: string): Promise<DomainHistory | undefined> {
    const result = await db!.select().from(domainHistory).where(eq(domainHistory.id, historyId)).limit(1);
    return result[0];
  }

  async getUserDomainHistory(userId: string, limit: number = 20, offset: number = 0): Promise<DomainHistory[]> {
    return await db!
      .select()
      .from(domainHistory)
      .where(eq(domainHistory.userId, userId))
      .orderBy(desc(domainHistory.analyzedAt))
      .limit(limit)
      .offset(offset);
  }

  async searchDomainHistory(userId: string, searchTerm: string): Promise<DomainHistory[]> {
    return await db!
      .select()
      .from(domainHistory)
      .where(
        and(
          eq(domainHistory.userId, userId),
          ilike(domainHistory.domain, `%${searchTerm}%`)
        )
      )
      .orderBy(desc(domainHistory.analyzedAt))
      .limit(10);
  }

  async getRecentAnalysis(userId: string, normalizedUrl: string): Promise<AnalysisResult | undefined> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentHistory = await db!
      .select()
      .from(domainHistory)
      .where(
        and(
          eq(domainHistory.userId, userId),
          eq(domainHistory.normalizedUrl, normalizedUrl),
          gte(domainHistory.analyzedAt, twentyFourHoursAgo)
        )
      )
      .orderBy(desc(domainHistory.analyzedAt))
      .limit(1);

    if (recentHistory.length === 0) {
      return undefined;
    }

    return await this.getAnalysisResultByHistoryId(recentHistory[0].id);
  }

  async getAnalysisResultByHistoryId(historyId: string): Promise<AnalysisResult | undefined> {
    const result = await db!
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.domainHistoryId, historyId))
      .limit(1);

    if (result.length === 0) {
      return undefined;
    }

    // Parse and validate the analysis data from JSONB
    const parsed = analysisResultSchema.safeParse(result[0].analysisData);
    if (!parsed.success) {
      console.error('Failed to parse analysis data:', parsed.error);
      return undefined;
    }

    return parsed.data;
  }
}

// Export appropriate storage based on database availability
export const storage: IStorage = db ? new DatabaseStorage() : new MemoryStorage();


import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, TrendingUp, Target, BarChart3, RefreshCw, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface DomainHistory {
  id: string;
  userId: string;
  domain: string;
  normalizedUrl: string;
  aiVisibilityScore: number;
  status: string;
  analyzedAt: string;
}

interface HistoryResponse {
  domains: DomainHistory[];
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: historyData, isLoading: historyLoading } = useQuery<HistoryResponse>({
    queryKey: ["/api/history", searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/history?search=${encodeURIComponent(searchQuery)}`
        : "/api/history";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      return await res.json();
    },
    enabled: isAuthenticated,
  });

  const reanalyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/history/reanalyze", { url });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: data.cached ? "Using recent analysis" : "Analysis Complete!",
        description: data.cached
          ? "Your analysis is less than 24 hours old."
          : `Updated score: ${data.overallScore}/100`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Re-analysis failed",
        description: error.message || "Failed to re-analyze domain",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const domains = historyData?.domains || [];
  const totalAnalyses = domains.length;
  const avgScore = domains.length > 0
    ? Math.round(domains.reduce((sum, d) => sum + d.aiVisibilityScore, 0) / domains.length)
    : 0;
  const recentDomains = domains.slice(0, 3);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                data-testid="button-back-home"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <h1 className="text-4xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.name}! Track your AI visibility across platforms.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card data-testid="card-total-analyses">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-analyses">{totalAnalyses}</div>
              <p className="text-xs text-muted-foreground">Domains analyzed</p>
            </CardContent>
          </Card>

          <Card data-testid="card-avg-score">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(avgScore)}`} data-testid="text-avg-score">
                {avgScore}/100
              </div>
              <p className="text-xs text-muted-foreground">Across all domains</p>
            </CardContent>
          </Card>

          <Card data-testid="card-recent-activity">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-recent-count">{recentDomains.length}</div>
              <p className="text-xs text-muted-foreground">Last 3 analyses</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-domains"
            />
          </div>
        </div>

        {/* Domain History */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Domains</h2>

          {historyLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : domains.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No analyses yet</h3>
                <p className="text-muted-foreground mb-4 text-center">
                  Start by analyzing your first domain on the home page.
                </p>
                <Button onClick={() => navigate("/")} data-testid="button-analyze-first">
                  Analyze Your First Domain
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {domains.map((domain) => (
                <Card key={domain.id} className="hover-elevate" data-testid={`card-domain-${domain.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg" data-testid={`text-domain-${domain.id}`}>
                          {domain.domain}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Analyzed {formatDistanceToNow(new Date(domain.analyzedAt), { addSuffix: true })}
                        </CardDescription>
                      </div>
                      <Badge variant={getScoreBadgeVariant(domain.aiVisibilityScore)} data-testid={`badge-score-${domain.id}`}>
                        {domain.aiVisibilityScore}/100
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/?url=${encodeURIComponent(domain.normalizedUrl)}`)}
                        data-testid={`button-view-${domain.id}`}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => reanalyzeMutation.mutate(domain.normalizedUrl)}
                        disabled={reanalyzeMutation.isPending}
                        data-testid={`button-reanalyze-${domain.id}`}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${reanalyzeMutation.isPending ? "animate-spin" : ""}`} />
                        Re-analyze
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

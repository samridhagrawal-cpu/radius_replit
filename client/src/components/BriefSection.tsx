import { useQuery } from "@tanstack/react-query";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useMemo } from "react";

interface BriefSectionProps {
  overallScore: number;
  platformScores: Array<{ platform: string; score: number }>;
  brandName: string;
  domain: string;
}

export function BriefSection({ overallScore, platformScores, brandName, domain }: BriefSectionProps) {
  // Memoize payload to prevent unnecessary re-renders
  const payload = useMemo(() => ({
    overallScore,
    platformScores,
    brandName,
    domain,
  }), [overallScore, platformScores, brandName, domain]);

  // Gate query - only run when we have valid data
  const hasValidData = Boolean(
    overallScore !== undefined && 
    overallScore !== null && 
    platformScores && 
    platformScores.length > 0 && 
    brandName && 
    domain
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['/api/generate-brief', brandName, overallScore],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/generate-brief', payload);
      return await response.json() as { brief: string };
    },
    enabled: hasValidData,
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <div className="border rounded-lg p-6 bg-card" data-testid="brief-section">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sparkles className="w-5 h-5 text-primary" data-testid="icon-sparkles" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold">AI Analysis Brief</h3>
          {!hasValidData ? (
            <p className="text-sm text-muted-foreground" data-testid="brief-no-data">
              Insufficient data to generate brief.
            </p>
          ) : isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground" data-testid="loading-brief">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Generating insights...</span>
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 text-destructive" data-testid="brief-error">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                Failed to generate brief. {error instanceof Error ? error.message : 'Please try again.'}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid="brief-text">
              {data?.brief || "Unable to generate brief at this time."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Sparkles, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface BriefSectionProps {
  overallScore: number;
  platformScores: Array<{ platform: string; score: number }>;
  brandName: string;
  domain: string;
}

export function BriefSection({ overallScore, platformScores, brandName, domain }: BriefSectionProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/generate-brief', brandName, overallScore],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/generate-brief', {
        overallScore,
        platformScores,
        brandName,
        domain,
      });
      return await response.json() as { brief: string };
    },
  });

  return (
    <div className="border rounded-lg p-6 bg-card" data-testid="brief-section">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sparkles className="w-5 h-5 text-primary" data-testid="icon-sparkles" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold">AI Analysis Brief</h3>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground" data-testid="loading-brief">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Generating insights...</span>
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

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import LandingNav from "@/components/LandingNav";
import HeroSection from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import DashboardHeader from "@/components/DashboardHeader";
import AnalysisResults from "@/components/AnalysisResults";
import type { AnalysisResult } from "@shared/schema";

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [pendingResult, setPendingResult] = useState<AnalysisResult | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest('POST', '/api/analyze', { url });
      return await response.json() as AnalysisResult;
    },
    onSuccess: (data) => {
      // Hold result until timeline completes - no popup notifications
      setPendingResult(data);
    },
    onError: (error: Error) => {
      // Reset timeline on error - no popup notifications
      setPendingResult(null);
      console.error('Analysis failed:', error.message);
    },
  });

  const handleAnalyze = (url: string) => {
    analyzeMutation.mutate(url);
  };

  const handleNewAnalysis = useCallback(() => {
    setAnalysisResult(null);
    setPendingResult(null);
  }, []);

  const handleTimelineComplete = useCallback(() => {
    // Show results only after timeline exit animation completes
    setPendingResult(current => {
      if (current) {
        setAnalysisResult(current);
        return null;
      }
      return current;
    });
  }, []);

  if (!analysisResult) {
    return (
      <>
        <LandingNav />
        <HeroSection 
          onAnalyze={handleAnalyze} 
          isLoading={analyzeMutation.isPending || !!pendingResult}
          onTimelineComplete={handleTimelineComplete}
        />
        <FeaturesSection />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader websiteUrl={analysisResult.url} onNewAnalysis={handleNewAnalysis} />
      <AnalysisResults data={analysisResult} />
    </div>
  );
}

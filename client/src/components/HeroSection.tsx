import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { extractCleanDomain, getUrlError } from "@/lib/urlNormalizer";
import { AnalysisTimeline } from "@/components/AnalysisTimeline";

interface HeroSectionProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  onTimelineComplete?: () => void;
}

export default function HeroSection({ onAnalyze, isLoading, onTimelineComplete }: HeroSectionProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [processedDomain, setProcessedDomain] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Real-time validation feedback
  useEffect(() => {
    if (!url.trim()) {
      setError("");
      setProcessedDomain("");
      setShowConfirmation(false);
      return;
    }

    // Check for immediate errors (localhost, IP, etc.)
    const immediateError = getUrlError(url);
    if (immediateError) {
      setError(immediateError);
      setProcessedDomain("");
      setShowConfirmation(false);
      return;
    }

    // Try to extract domain for preview
    try {
      const domain = extractCleanDomain(url);
      setProcessedDomain(domain);
      setError("");
      setShowConfirmation(true);
    } catch (err) {
      // Don't show error while typing, only on submit
      setProcessedDomain("");
      setShowConfirmation(false);
    }
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter a website URL");
      return;
    }

    try {
      // Extract clean domain
      const cleanDomain = extractCleanDomain(url);
      
      // Pass clean domain to analysis
      onAnalyze(cleanDomain);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Please enter a valid URL (e.g., example.com)");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-16 px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="md:text-6xl lg:text-7xl font-black tracking-tight text-black text-[75px]">
          Increase your visibility
          <br />
          <span className="relative inline-block">
            <span className="relative inline-block text-white mt-[19px] mb-[19px]" style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(0, 0, 0, 0.2) 100%), #000',
              padding: '8px 20px',
              borderRadius: '12px'
            }}>
              across AI platforms
            </span>
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Discover how ChatGPT, Claude, Gemini, and Perplexity perceive your brand. Get actionable insights to boost your AI presence.
        </p>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-12">
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder="Enter your website URL (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="w-full border-0 focus-visible:ring-0 text-base h-16 bg-white text-black placeholder:text-gray-400 rounded-full"
              style={{
                paddingRight: '60px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)'
              }}
              data-testid="input-url"
            />
            <Button
              type="submit"
              disabled={isLoading || !showConfirmation}
              size="icon"
              className="h-12 w-12 bg-black hover:bg-gray-900 text-white rounded-full disabled:opacity-50"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
              data-testid="button-analyze"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {/* Visual confirmation of processed domain */}
          {showConfirmation && processedDomain && !error && (
            <div className="flex items-center gap-2 mt-3 text-left" data-testid="text-domain-confirmation">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">
                Analyzing: <span className="font-semibold text-black">{processedDomain}</span>
              </span>
            </div>
          )}
          
          {/* Error display */}
          {error && (
            <div className="flex items-center gap-2 mt-3 text-left" data-testid="text-error">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}
          
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Free comprehensive analysis • Results in 30 seconds
          </p>
        </form>

        {/* Progress Bar - Shows during analysis */}
        {isLoading && (
          <div className="mt-8">
            <AnalysisTimeline 
              isActive={isLoading}
              onComplete={onTimelineComplete}
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-8 pt-8 mt-[-35px] mb-[-35px]">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">500+ analyses run</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-black">89%</span>
            <span className="text-sm text-gray-600">avg improvement</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-black">4</span>
            <span className="text-sm text-gray-600">AI platforms analyzed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

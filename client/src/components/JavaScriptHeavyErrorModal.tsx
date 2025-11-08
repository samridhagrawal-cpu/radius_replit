import { X, AlertTriangle, Search, Lightbulb } from 'lucide-react';
import type { AnalysisError } from '@shared/schema';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  errorDetails: AnalysisError;
}

export function JavaScriptHeavyErrorModal({ isOpen, onClose, url, errorDetails }: Props) {
  if (!isOpen) return null;

  const { technicalDetails, suggestions } = errorDetails;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onClose}
        data-testid="modal-backdrop"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full pointer-events-auto animate-slideUp overflow-hidden border"
          onClick={(e) => e.stopPropagation()}
          data-testid="error-modal"
        >
          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 pb-12">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              data-testid="button-close-modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <AlertTriangle className="w-10 h-10 text-yellow-400" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-white text-center mb-3">
              Analysis Unavailable
            </h2>
            <p className="text-white/80 text-center text-lg">
              We couldn't analyze this JavaScript-heavy website
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* URL Display */}
            <div className="mb-6 p-4 bg-muted rounded-lg border">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Attempted URL
              </div>
              <div className="font-mono text-sm text-foreground break-all">
                {url}
              </div>
            </div>

            {/* Problem Explanation */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                What Happened?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {errorDetails.message} Our analyzer relies on static HTML content, 
                but your website appears to load most of its content dynamically 
                using JavaScript frameworks (like React, Vue, or Angular).
              </p>
            </div>

            {/* Technical Details */}
            <div className="mb-6 p-4 bg-muted rounded-lg border">
              <div className="text-sm font-semibold text-foreground mb-3">
                Technical Analysis
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Static Content</div>
                  <div className={`text-sm font-semibold ${
                    technicalDetails.contentLength < 200 ? 'text-red-600' : 
                    technicalDetails.contentLength < 500 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {technicalDetails.contentLength} characters
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Heading Tags</div>
                  <div className={`text-sm font-semibold ${
                    technicalDetails.headingCount === 0 ? 'text-red-600' : 
                    technicalDetails.headingCount < 3 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {technicalDetails.headingCount} found
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Page Title</div>
                  <div className={`text-sm font-semibold ${
                    technicalDetails.hasTitle ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {technicalDetails.hasTitle ? 'Present ✓' : 'Missing ✗'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Est. JS Coverage</div>
                  <div className={`text-sm font-semibold ${
                    technicalDetails.estimatedJSCoverage > 80 ? 'text-red-600' : 
                    technicalDetails.estimatedJSCoverage > 60 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    ~{Math.round(technicalDetails.estimatedJSCoverage)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                How to Fix This
              </h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-muted-foreground/50 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover-elevate active-elevate-2 transition-colors"
                data-testid="button-dismiss-modal"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

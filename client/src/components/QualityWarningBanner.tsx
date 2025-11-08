import { AlertCircle, Info } from 'lucide-react';
import type { ScrapingQuality } from '@shared/schema';

interface Props {
  qualityWarning: ScrapingQuality;
}

export function QualityWarningBanner({ qualityWarning }: Props) {
  const isLimited = qualityWarning.severity === 'limited';
  const isWarning = qualityWarning.severity === 'warning';

  if (!isLimited && !isWarning) return null;

  return (
    <div
      className={`rounded-lg border p-4 mb-6 ${
        isLimited
          ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900'
          : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
      }`}
      data-testid="quality-warning-banner"
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          {isLimited ? (
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          ) : (
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3
            className={`text-sm font-semibold mb-1 ${
              isLimited
                ? 'text-yellow-900 dark:text-yellow-100'
                : 'text-blue-900 dark:text-blue-100'
            }`}
          >
            {isLimited ? 'Partial Analysis' : 'Analysis Note'}
          </h3>
          <p
            className={`text-sm mb-2 ${
              isLimited
                ? 'text-yellow-800 dark:text-yellow-200'
                : 'text-blue-800 dark:text-blue-200'
            }`}
          >
            {qualityWarning.recommendation}
          </p>

          {/* Technical Details Summary */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
            <span>
              Content: {qualityWarning.technicalDetails.contentLength} chars
            </span>
            <span>
              Headings: {qualityWarning.technicalDetails.headingCount}
            </span>
            <span>
              Title: {qualityWarning.technicalDetails.hasTitle ? 'Yes' : 'No'}
            </span>
            <span>
              JS Coverage: ~{Math.round(qualityWarning.technicalDetails.estimatedJSCoverage)}%
            </span>
          </div>

          {/* Suggestions */}
          {qualityWarning.suggestions && qualityWarning.suggestions.length > 0 && (
            <ul className="space-y-1 mt-2">
              {qualityWarning.suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={`text-xs flex items-start gap-2 ${
                    isLimited
                      ? 'text-yellow-700 dark:text-yellow-300'
                      : 'text-blue-700 dark:text-blue-300'
                  }`}
                >
                  <span className="mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  subtitle: string;
  duration: number;
}

const STEPS: Step[] = [
  { label: 'Querying AI Platforms', subtitle: 'ChatGPT • Claude • Gemini • Perplexity', duration: 6000 },
  { label: 'Analyzing Competitors', subtitle: 'Discovering similar brands', duration: 7000 },
  { label: 'Processing Responses', subtitle: 'Evaluating 8 quality criteria', duration: 6000 },
  { label: 'Generating Insights', subtitle: 'Building recommendations', duration: 6000 },
  { label: 'Finalizing Report', subtitle: 'Calculating visibility scores', duration: 5000 },
];

type StepStatus = 'pending' | 'active' | 'completed';

interface AnalysisTimelineProps {
  isActive: boolean;
  onComplete?: () => void;
}

export function AnalysisTimeline({ isActive, onComplete }: AnalysisTimelineProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    Array(STEPS.length).fill('pending')
  );
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      setIsExiting(false);
      setCurrentStep(0);
      setStepStatuses(Array(STEPS.length).fill('pending'));
      setProgress(0);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !isVisible) return;

    let isCancelled = false;
    const timers: NodeJS.Timeout[] = [];

    const runTimeline = async () => {
      for (let i = 0; i < STEPS.length; i++) {
        if (isCancelled) break;

        // Mark current step as active
        setStepStatuses(prev => {
          const newStatuses = [...prev];
          newStatuses[i] = 'active';
          return newStatuses;
        });
        setCurrentStep(i);

        // Animate progress bar
        const step = STEPS[i];
        const progressInterval = 50;
        const progressIncrement = (progressInterval / step.duration) * 100;
        let currentProgress = 0;

        const progressTimer = setInterval(() => {
          if (isCancelled) return;
          currentProgress += progressIncrement;
          if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(progressTimer);
          }
          setProgress(currentProgress);
        }, progressInterval);
        timers.push(progressTimer);

        // Wait for step duration
        await new Promise(resolve => {
          const timer = setTimeout(resolve, step.duration);
          timers.push(timer);
        });

        if (isCancelled) break;

        // Mark step as completed
        clearInterval(progressTimer);
        setProgress(100);
        setStepStatuses(prev => {
          const newStatuses = [...prev];
          newStatuses[i] = 'completed';
          return newStatuses;
        });
        setProgress(0);
      }

      if (isCancelled) return;

      // All steps completed - wait then exit
      const exitTimer1 = setTimeout(() => {
        if (isCancelled) return;
        setIsExiting(true);
        const exitTimer2 = setTimeout(() => {
          if (isCancelled) return;
          setIsVisible(false);
          onComplete?.();
        }, 600);
        timers.push(exitTimer2);
      }, 1500);
      timers.push(exitTimer1);
    };

    runTimeline();

    // Cleanup function
    return () => {
      isCancelled = true;
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [isActive, isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`w-full max-w-[800px] mx-auto mt-12 mb-8 transition-all duration-600 ${
        isExiting ? 'opacity-0 -translate-y-5' : 'opacity-100 translate-y-0'
      }`}
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={STEPS.length}
      aria-label="Analysis progress"
      data-testid="analysis-timeline"
    >
      {/* Desktop: Horizontal Layout */}
      <div className="hidden md:block">
        <div className="relative flex justify-between items-start">
          {STEPS.map((step, index) => {
            const status = stepStatuses[index];
            const isLast = index === STEPS.length - 1;
            const showProgress = status === 'active';

            return (
              <div key={index} className="flex-1 relative" style={{ animationDelay: `${index * 50}ms` }}>
                {/* Connecting Line */}
                {!isLast && (
                  <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-300 -z-10">
                    {/* Progress overlay */}
                    {showProgress && (
                      <div
                        className="absolute top-0 left-0 h-full bg-black origin-left transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                    {/* Completed overlay */}
                    {status === 'completed' && (
                      <div className="absolute top-0 left-0 h-full w-full bg-black" />
                    )}
                  </div>
                )}

                {/* Step Node */}
                <div className="flex flex-col items-center">
                  <div
                    className={`relative transition-all duration-300 ${
                      status === 'pending'
                        ? 'w-8 h-8 border-2 border-gray-300 bg-white rounded-full'
                        : status === 'active'
                        ? 'w-10 h-10 border-2 border-black bg-white rounded-full shadow-lg animate-pulse-subtle'
                        : 'w-8 h-8 bg-black border-2 border-black rounded-full'
                    }`}
                    data-testid={`timeline-step-${index}`}
                  >
                    {status === 'completed' && (
                      <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
                        <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-4 text-center max-w-[140px]">
                    <div className="text-sm font-medium text-gray-900 tracking-tight leading-tight">
                      {step.label}
                    </div>
                    <div className="text-xs font-normal text-gray-500 tracking-tight mt-1">
                      {step.subtitle}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: Vertical Layout */}
      <div className="md:hidden pl-6">
        <div className="relative space-y-8">
          {STEPS.map((step, index) => {
            const status = stepStatuses[index];
            const isLast = index === STEPS.length - 1;
            const showProgress = status === 'active';

            return (
              <div key={index} className="relative" style={{ animationDelay: `${index * 50}ms` }}>
                {/* Connecting Line */}
                {!isLast && (
                  <div className="absolute top-8 left-4 w-0.5 h-8 bg-gray-300">
                    {/* Progress overlay */}
                    {showProgress && (
                      <div
                        className="absolute top-0 left-0 w-full bg-black origin-top transition-all duration-300"
                        style={{ height: `${progress}%` }}
                      />
                    )}
                    {/* Completed overlay */}
                    {status === 'completed' && (
                      <div className="absolute top-0 left-0 w-full h-full bg-black" />
                    )}
                  </div>
                )}

                {/* Step Content */}
                <div className="flex items-start gap-4">
                  {/* Step Node */}
                  <div
                    className={`flex-shrink-0 transition-all duration-300 ${
                      status === 'pending'
                        ? 'w-8 h-8 border-2 border-gray-300 bg-white rounded-full'
                        : status === 'active'
                        ? 'w-10 h-10 border-2 border-black bg-white rounded-full shadow-lg animate-pulse-subtle'
                        : 'w-8 h-8 bg-black border-2 border-black rounded-full'
                    }`}
                    data-testid={`timeline-step-mobile-${index}`}
                  >
                    {status === 'completed' && (
                      <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
                        <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="flex-1 pt-1">
                    <div className="text-sm font-medium text-gray-900 tracking-tight">
                      {step.label}
                    </div>
                    <div className="text-xs font-normal text-gray-500 tracking-tight mt-1">
                      {step.subtitle}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">
        Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]?.label}
      </span>
    </div>
  );
}

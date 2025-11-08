import { useState, useEffect } from 'react';

interface AnalysisTimelineProps {
  isActive: boolean;
  onComplete?: () => void;
}

const ANALYSIS_STEPS = [
  { task: 'Querying AI platforms (ChatGPT, Claude, Gemini, Perplexity)', duration: 6000 },
  { task: 'Discovering and analyzing competitor brands', duration: 7000 },
  { task: 'Processing AI responses across 8 quality criteria', duration: 6000 },
  { task: 'Generating personalized optimization insights', duration: 6000 },
  { task: 'Calculating visibility scores and finalizing report', duration: 5000 },
];

export function AnalysisTimeline({ isActive, onComplete }: AnalysisTimelineProps) {
  const [percentage, setPercentage] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setPercentage(0);
      setCurrentTask('');
      setIsVisible(false);
      return;
    }

    setPercentage(0);
    setCurrentTask(ANALYSIS_STEPS[0].task);
    setIsVisible(true);

    const totalDuration = ANALYSIS_STEPS.reduce((sum, step) => sum + step.duration, 0);
    let elapsed = 0;
    let currentStepIndex = 0;
    const timers: NodeJS.Timeout[] = [];

    const interval = setInterval(() => {
      elapsed += 100;
      const newPercentage = Math.min(Math.round((elapsed / totalDuration) * 100), 100);
      
      // Update current task based on elapsed time
      let cumulativeDuration = 0;
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        cumulativeDuration += ANALYSIS_STEPS[i].duration;
        if (elapsed < cumulativeDuration) {
          currentStepIndex = i;
          break;
        }
      }

      setPercentage(newPercentage);
      setCurrentTask(ANALYSIS_STEPS[currentStepIndex].task);

      if (elapsed >= totalDuration) {
        clearInterval(interval);
        // Hide after completion
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
          onComplete?.();
        }, 1500);
        timers.push(hideTimer);
      }
    }, 100);
    timers.push(interval);

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [isActive, onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className="w-full flex justify-center items-center mt-10 mb-8 animate-in fade-in duration-400"
      data-testid="analysis-timeline"
      role="status"
      aria-live="polite"
      aria-label={`Analysis progress: ${percentage}%`}
    >
      <div className="w-full max-w-[600px] px-6">
        {/* Percentage Display */}
        <div className="text-center mb-6">
          <p 
            className="md:text-6xl font-bold tracking-tight text-[50px]"
            style={{ color: '#6B7280' }}
            data-testid="progress-percentage"
          >
            {percentage}%
          </p>
        </div>

        {/* Progress Bar */}
        <div 
          className="w-full h-3 rounded-full overflow-hidden mb-4"
          style={{ backgroundColor: '#E0E0E0' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: '#9E9E9E'
            }}
            data-testid="progress-bar-fill"
          />
        </div>

        {/* Current Task */}
        <div className="text-center">
          <p 
            className="text-base md:text-lg font-normal"
            style={{ color: '#9CA3AF' }}
            data-testid="progress-task"
          >
            {currentTask}
          </p>
        </div>
      </div>
    </div>
  );
}

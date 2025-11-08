import { Button } from "@/components/ui/button";
import { Circle, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardHeaderProps {
  websiteUrl?: string;
  onNewAnalysis?: () => void;
}

export default function DashboardHeader({ websiteUrl, onNewAnalysis }: DashboardHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`
        fixed top-5 left-1/2 -translate-x-1/2 z-50
        w-[90%] max-w-6xl
        transition-all duration-500 ease-out
        ${scrolled ? 'top-3' : 'top-5'}
      `}
      data-testid="floating-nav-analysis"
    >
      <div 
        className={`
          relative overflow-hidden
          bg-white/90 dark:bg-white/85
          backdrop-blur-xl
          rounded-full
          border border-white/30
          shadow-[0_8px_32px_rgba(0,0,0,0.06)]
          transition-all duration-500
          ${scrolled ? 'shadow-[0_12px_40px_rgba(0,0,0,0.1)]' : ''}
        `}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
        }}
      >
        {/* Subtle inner glow for glassmorphism */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
        
        <div className="relative flex items-center justify-between px-6 py-3 h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-3 flex-shrink-0 min-w-[150px]">
            <div className="h-9 w-9 bg-black rounded-full flex items-center justify-center">
              <Circle className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-black">Radius</span>
          </div>
          
          {/* Center Status Section */}
          {websiteUrl && (
            <div className="flex flex-col items-center flex-1 gap-0.5">
              <span className="text-xs text-gray-500 font-medium">
                Analyzing
              </span>
              <span 
                className="text-sm font-semibold text-gray-700 max-w-md truncate" 
                data-testid="text-analyzed-url"
              >
                {websiteUrl}
              </span>
            </div>
          )}
          
          {/* Action Button */}
          {onNewAnalysis && (
            <div className="flex items-center flex-shrink-0 min-w-[150px] justify-end">
              <Button 
                variant="outline"
                onClick={onNewAnalysis}
                className="
                  rounded-xl px-5 py-2.5
                  border border-black/10
                  bg-transparent
                  text-gray-700 font-medium
                  transition-all duration-300
                  hover:text-black hover:bg-black/5 hover:border-black/20
                  active-elevate-2
                "
                data-testid="button-new-analysis"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

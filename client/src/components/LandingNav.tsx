import { Button } from "@/components/ui/button";
import { Circle } from "lucide-react";
import { useEffect, useState } from "react";

export default function LandingNav() {
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
      data-testid="floating-nav"
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
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="h-9 w-9 bg-black rounded-full flex items-center justify-center">
              <Circle className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-black">GeoPulse</span>
          </div>
          
          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
            <a 
              href="#features" 
              className="
                px-5 py-2.5 rounded-xl
                text-sm font-medium text-gray-600
                transition-all duration-300
                hover:text-black hover:bg-black/5
                active-elevate-2
              " 
              data-testid="link-features"
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className="
                px-5 py-2.5 rounded-xl
                text-sm font-medium text-gray-600
                transition-all duration-300
                hover:text-black hover:bg-black/5
                active-elevate-2
              " 
              data-testid="link-pricing"
            >
              Pricing
            </a>
            <a 
              href="#about" 
              className="
                px-5 py-2.5 rounded-xl
                text-sm font-medium text-gray-600
                transition-all duration-300
                hover:text-black hover:bg-black/5
                active-elevate-2
              " 
              data-testid="link-about"
            >
              About
            </a>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <a 
              href="#login" 
              className="
                hidden sm:inline-flex
                px-5 py-2.5 rounded-xl
                text-sm font-medium text-gray-700
                transition-all duration-300
                hover:text-black hover:bg-black/5
                active-elevate-2
              "
              data-testid="link-login"
            >
              Login
            </a>
            <Button 
              size="sm" 
              className="
                bg-black hover:bg-gray-900 text-white 
                rounded-xl px-6 py-2.5
                font-semibold
                transition-all duration-300
                hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]
                hover:-translate-y-0.5
              "
              data-testid="button-get-started"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

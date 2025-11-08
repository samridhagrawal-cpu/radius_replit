import { Target, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureCardProps {
  title: string;
  description: string;
  visualization: 'chart' | 'bars' | 'table' | 'mentions';
}

const FeatureCard = ({ title, description, visualization, animationDelay }: FeatureCardProps & { animationDelay?: string }) => {
  return (
    <div className={`group relative bg-card border-2 border-border rounded-2xl p-8 hover-elevate transition-all duration-300 animate-fade-in-up ${animationDelay || ''}`} data-testid={`card-feature-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="mb-6">
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          {title}
        </h3>
        <p className="text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      <div className="relative aspect-[16/9] bg-muted/30 rounded-xl overflow-hidden border border-border">
        {visualization === 'chart' && <ChartVisualization />}
        {visualization === 'bars' && <BarsVisualization />}
        {visualization === 'table' && <TableVisualization />}
        {visualization === 'mentions' && <MentionsVisualization />}
        
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-all duration-300" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />
    </div>
  );
};

const ChartVisualization = () => (
  <div className="w-full h-full flex items-center justify-center p-6">
    <svg viewBox="0 0 400 200" className="w-full h-full">
      <path
        d="M 20 140 Q 80 120, 120 100 T 200 80 T 280 100 T 360 120"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        className="animate-draw-line"
      />
      <path
        d="M 20 160 Q 80 145, 120 130 T 200 110 T 280 130 T 360 150"
        fill="none"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="3"
        className="animate-draw-line animation-delay-200"
      />
      <circle cx="200" cy="80" r="6" fill="hsl(var(--primary))" className="animate-pulse" />
      <circle cx="200" cy="110" r="6" fill="hsl(var(--muted-foreground))" className="animate-pulse" />
    </svg>
  </div>
);

const BarsVisualization = () => (
  <div className="w-full h-full flex items-end justify-around p-8 gap-3">
    {[
      { height: '75%', intensity: 'primary', label: 'Twitter 39%' },
      { height: '90%', intensity: 'primary', label: 'YouTube 29%' },
      { height: '45%', intensity: 'muted', label: 'Wiki 15%' },
      { height: '60%', intensity: 'muted', label: 'LinkedIn' },
      { height: '55%', intensity: 'muted', label: 'Other' },
    ].map((bar, index) => (
      <div key={index} className="flex-1 flex flex-col items-center gap-2">
        <div
          className={`w-full ${bar.intensity === 'primary' ? 'bg-primary/60' : 'bg-muted-foreground/30'} rounded-t-lg transition-all duration-700`}
          style={{ height: bar.height }}
        />
        <span className="text-xs text-muted-foreground text-center truncate w-full">{bar.label}</span>
      </div>
    ))}
  </div>
);

const TableVisualization = () => (
  <div className="w-full h-full p-6 flex flex-col justify-center">
    <div className="space-y-3">
      {[
        { rank: '1', name: 'Salesforce', score: '39%', trend: '+4%', positive: true },
        { rank: '2', name: 'Hubspot', score: '33%', trend: '-1%', positive: false },
        { rank: '3', name: 'Zoho CRM', score: '24%', trend: '-6%', positive: false },
        { rank: '4', name: 'Pipedrive', score: '23%', trend: '0%', positive: null },
      ].map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between py-3 px-4 bg-card rounded-lg border border-border hover-elevate transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-muted-foreground w-6">{item.rank}</span>
            <span className="text-sm font-semibold text-foreground">{item.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-foreground">{item.score}</span>
            <span className={`text-xs font-semibold ${
              item.positive === true ? 'text-primary' : 
              item.positive === false ? 'text-destructive' : 
              'text-muted-foreground'
            }`}>
              {item.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MentionsVisualization = () => (
  <div className="w-full h-full p-6 flex flex-col justify-center gap-4">
    {[
      { position: '1st', color: 'bg-primary', width: '85%', Icon: Target },
      { position: '2nd', color: 'bg-primary/70', width: '70%', Icon: Star },
      { position: '3rd', color: 'bg-muted-foreground/50', width: '60%', Icon: Award },
    ].map((item, index) => (
      <div key={index} className="flex items-center gap-3">
        <item.Icon className="w-6 h-6 text-primary" />
        <div className="flex-1 bg-muted/50 rounded-full h-8 overflow-hidden">
          <div
            className={`h-full ${item.color} rounded-full flex items-center justify-end px-3 transition-all duration-700`}
            style={{ width: item.width }}
          >
            <span className="text-xs font-bold text-primary-foreground">#{item.position} position</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const FeaturesSection = () => {
  const features = [
    {
      title: 'Visibility',
      description: 'Understand how your brand is performing in AI Search across ChatGPT, Claude, Gemini, and Perplexity.',
      visualization: 'chart' as const,
    },
    {
      title: 'Sources',
      description: 'Understand which sources have the highest impact on your AI visibility and rankings.',
      visualization: 'bars' as const,
    },
    {
      title: 'Competitor Tracking',
      description: 'Measure your performance against your competitors with real-time ranking analysis.',
      visualization: 'table' as const,
    },
    {
      title: 'Recent Mentions',
      description: 'Track and follow conversations where you are mentioned across AI platforms in real-time.',
      visualization: 'mentions' as const,
    },
  ];

  return (
    <section className="w-full bg-background py-20 md:py-32" data-testid="section-features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 md:mb-20 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
            Comprehensive AI Visibility
            <br />
            <span className="relative inline-block mt-2">
              <span className="bg-foreground text-background px-6 py-2 rounded-xl">
                Analytics
              </span>
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mt-6">
            Everything you need to dominate AI search and discovery
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              visualization={feature.visualization}
              animationDelay={index === 0 ? 'animation-delay-200' : index === 1 ? 'animation-delay-400' : index === 2 ? 'animation-delay-600' : 'animation-delay-800'}
            />
          ))}
        </div>

        <div className="mt-16 text-center animate-fade-in-up">
          <p className="text-muted-foreground mb-6">
            Ready to see your complete AI visibility profile?
          </p>
          <Button 
            size="lg"
            data-testid="button-start-analysis-features"
          >
            Start Free Analysis →
          </Button>
        </div>
      </div>
    </section>
  );
};

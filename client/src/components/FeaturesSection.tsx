import { Target, Star, Award, Lightbulb, BarChart3, CheckCircle, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureCardProps {
  title: string;
  description: string;
  visualization: 'chart' | 'recommendations' | 'table' | 'download-report';
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
        {visualization === 'recommendations' && <RecommendationsVisualization />}
        {visualization === 'table' && <TableVisualization />}
        {visualization === 'download-report' && <DownloadReportVisualization />}
        
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

const RecommendationsVisualization = () => (
  <div className="w-full h-full p-6 flex flex-col justify-center gap-3">
    {[
      {
        Icon: Lightbulb,
        title: 'Implement FAQ Section',
        impact: 'HIGH',
        impactBg: 'bg-foreground',
        impactText: 'text-background',
        points: '+8-10 pts'
      },
      {
        Icon: BarChart3,
        title: 'Create Comparison Pages',
        impact: 'HIGH',
        impactBg: 'bg-foreground',
        impactText: 'text-background',
        points: '+7-9 pts'
      },
      {
        Icon: Star,
        title: 'Add Customer Testimonials',
        impact: 'MED',
        impactBg: 'bg-muted-foreground',
        impactText: 'text-background',
        points: '+5-7 pts'
      },
      {
        Icon: CheckCircle,
        title: 'Enhance Pricing Clarity',
        impact: 'MED',
        impactBg: 'bg-muted-foreground',
        impactText: 'text-background',
        points: '+4-6 pts'
      },
    ].map((item, index) => (
      <div
        key={index}
        className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover-elevate transition-all group"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <item.Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {item.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-1 rounded-full font-bold ${item.impactBg} ${item.impactText}`}>
            {item.impact}
          </span>
          <span className="text-xs font-bold text-foreground">
            {item.points}
          </span>
        </div>
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

const DownloadReportVisualization = () => (
  <div className="w-full h-full flex items-center justify-center p-6">
    <div className="text-center space-y-6">
      <div className="relative inline-block">
        <div className="w-32 h-40 bg-card border-2 border-border rounded-lg shadow-lg transform rotate-3 absolute -top-4 -right-4 opacity-30" />
        <div className="w-32 h-40 bg-card border-2 border-border rounded-lg shadow-lg transform -rotate-2 absolute -top-2 -right-2 opacity-50" />
        <div className="w-32 h-40 bg-card border-2 border-foreground rounded-lg shadow-xl relative overflow-hidden">
          <div className="p-3 space-y-2">
            <div className="h-3 bg-foreground rounded w-3/4" />
            <div className="h-2 bg-muted-foreground/30 rounded w-full" />
            <div className="h-2 bg-muted-foreground/30 rounded w-5/6" />
            <div className="h-2 bg-muted-foreground/30 rounded w-full" />
            <div className="mt-4 h-16 bg-muted/30 rounded" />
            <div className="h-2 bg-muted-foreground/30 rounded w-2/3" />
          </div>
          <div className="absolute bottom-2 right-2 bg-foreground text-background text-xs px-2 py-1 rounded font-bold">
            PDF
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-6 text-xs">
        <div className="text-center">
          <div className="font-bold text-foreground text-lg">20+</div>
          <div className="text-muted-foreground">Pages</div>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <div className="font-bold text-foreground text-lg">100+</div>
          <div className="text-muted-foreground">Insights</div>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <div className="font-bold text-foreground text-lg">4</div>
          <div className="text-muted-foreground">Platforms</div>
        </div>
      </div>
    </div>
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
      title: 'AI-Generated Recommendations',
      description: 'Get personalized, actionable insights ranked by impact to boost your AI visibility scores.',
      visualization: 'recommendations' as const,
    },
    {
      title: 'Competitor Tracking',
      description: 'Measure your performance against your competitors with real-time ranking analysis.',
      visualization: 'table' as const,
    },
    {
      title: 'Download Comprehensive Report',
      description: 'Export a detailed PDF report with all metrics, insights, and recommendations for your team.',
      visualization: 'download-report' as const,
    },
  ];

  return (
    <section className="w-full bg-background py-20 md:py-32 pt-[0px] pb-[0px]" data-testid="section-features">
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

        
      </div>
    </section>
  );
};

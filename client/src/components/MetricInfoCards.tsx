import { BarChart3, CheckCircle, Smile, Star, Scale, ThumbsUp, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface DimensionScore {
  dimension: string;
  score: number;
  fullMark: number;
}

interface MetricInfoCardsProps {
  data: DimensionScore[];
}

interface MetricInfo {
  id: string;
  name: string;
  Icon: typeof BarChart3;
  description: string;
  importance: string;
  scoringFactors: string[];
}

const METRICS_INFO: MetricInfo[] = [
  {
    id: 'Mention Rate',
    name: 'Mention Rate',
    Icon: BarChart3,
    description: 'Measures how frequently AI platforms reference your brand when responding to relevant queries in your industry.',
    importance: 'Direct indicator of brand visibility and thought leadership. Higher mention rates mean your brand is top-of-mind for AI systems.',
    scoringFactors: [
      'Frequency across different query types',
      'Consistency across AI platforms',
      'Context of mentions (primary vs. passing)',
      'Quality of citation details',
    ],
  },
  {
    id: 'Context Quality',
    name: 'Context Quality',
    Icon: CheckCircle,
    description: 'Evaluates the accuracy, depth, and relevance of information AI platforms provide about your brand.',
    importance: 'Ensures accurate brand representation and establishes credibility. Poor context can damage reputation.',
    scoringFactors: [
      'Factual accuracy of information',
      'Completeness of brand description',
      'Relevance to user queries',
      'Use of current information',
    ],
  },
  {
    id: 'Sentiment',
    name: 'Sentiment',
    Icon: Smile,
    description: 'Analyzes the overall tone and emotional quality of how AI platforms discuss your brand.',
    importance: 'Shapes first impressions and influences purchase decisions. Reflects market perception aggregated by AI.',
    scoringFactors: [
      'Positive vs. negative language',
      'Presence of endorsements',
      'Comparison sentiment',
      'Customer satisfaction indicators',
    ],
  },
  {
    id: 'Prominence',
    name: 'Prominence',
    Icon: Star,
    description: 'Measures how early and prominently your brand appears in AI responses and whether it\'s featured as a primary recommendation.',
    importance: 'Users act on the first 1-3 options presented. Higher prominence dramatically increases engagement and conversions.',
    scoringFactors: [
      'Position in response lists',
      'Formatting emphasis',
      'Discussion length vs. competitors',
      'Inclusion in summaries',
    ],
  },
  {
    id: 'Comparison',
    name: 'Comparison',
    Icon: Scale,
    description: 'Tracks how frequently your brand is included in AI-generated competitive comparisons and alternative recommendations.',
    importance: 'Critical for consideration in purchase decisions. Being excluded from comparisons means losing potential customers.',
    scoringFactors: [
      'Inclusion in alternatives lists',
      'Positioning vs. competitors',
      'Comparison scenario coverage',
      'Unique selling propositions highlighted',
    ],
  },
  {
    id: 'Recommendation',
    name: 'Recommendation',
    Icon: ThumbsUp,
    description: 'Measures the likelihood that AI platforms directly recommend your brand as a solution to specific user needs.',
    importance: 'Strongest form of AI endorsement. Drives highest-intent traffic and shortens sales cycles through validation.',
    scoringFactors: [
      'Direct recommendation frequency',
      'Conditional recommendations by use case',
      'Problem-solution matching strength',
      'Recommendation confidence level',
    ],
  },
];

const getScoreStatus = (score: number): 'excellent' | 'good' | 'moderate' | 'needs-improvement' => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'moderate';
  return 'needs-improvement';
};

export function MetricInfoCards({ data }: MetricInfoCardsProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCard = (metricId: string) => {
    setExpandedCard(expandedCard === metricId ? null : metricId);
  };

  return (
    <div className="mt-12 space-y-8 pt-[34px] pb-[34px]">
      {/* Section Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-foreground">Understanding Your Visibility Metrics</h3>
        <p className="text-muted-foreground">
          Learn what each dimension measures and how to improve it
        </p>
      </div>
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {METRICS_INFO.map((metric) => {
          const scoreData = data.find(d => d.dimension === metric.id);
          const score = scoreData?.score || 0;
          const status = getScoreStatus(score);
          const isExpanded = expandedCard === metric.id;
          const Icon = metric.Icon;

          return (
            <div
              key={metric.id}
              className="bg-card border border-border rounded-lg p-6 space-y-4 hover-elevate active-elevate-2"
              data-testid={`metric-card-${metric.id.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-foreground flex-shrink-0" />
                    <h4 className="font-semibold text-foreground">{metric.name}</h4>
                  </div>
                  <span className="text-2xl font-bold text-foreground">{score}%</span>
                </div>

                {/* Score Bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground transition-all"
                    style={{ width: `${score}%` }}
                  />
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    status === 'excellent' ? 'bg-foreground text-background' :
                    status === 'good' ? 'bg-foreground/70 text-background' :
                    status === 'moderate' ? 'bg-foreground/50 text-background' :
                    'bg-foreground/30 text-foreground'
                  }`}>
                    {status === 'excellent' ? 'Excellent' :
                     status === 'good' ? 'Good' :
                     status === 'moderate' ? 'Moderate' :
                     'Needs Improvement'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {metric.description}
              </p>

              {/* Expandable Section */}
              <button
                onClick={() => toggleCard(metric.id)}
                className="w-full flex items-center justify-between text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
                data-testid={`button-expand-${metric.id.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span>Learn more</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="space-y-4 pt-4 border-t border-border animate-in fade-in duration-200">
                  <div>
                    <h5 className="text-sm font-semibold text-foreground mb-2">Why It Matters</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {metric.importance}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-foreground mb-2">Scoring Factors</h5>
                    <ul className="space-y-1.5">
                      {metric.scoringFactors.map((factor, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-foreground/50 mt-0.5">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

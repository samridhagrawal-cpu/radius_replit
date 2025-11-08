# Radius Design Guidelines

## Design Approach
**System**: Modern SaaS Landing Page + Dashboard Pattern  
**References**: Linear (clean data hierarchy), Vercel Analytics (modern dashboard aesthetics), Stripe (clarity in complex data), Figma (premium landing design)  
**Principle**: Premium conversion-focused landing page that transitions seamlessly to clarity-first analytics dashboard

## Landing Page Design

### Visual Style
- **Premium aesthetic**: Clean, modern, professional with subtle gradients and smooth animations
- **Color palette**: Soft neutral background (#F8F7F5) with vibrant accent colors (blues, oranges)
- **Typography**: Large, bold headlines with generous spacing
- **Layout**: Centered content, generous whitespace, clear visual hierarchy

### Navigation Bar
- **Style**: Fixed position, clean minimal design with subtle background
- **Logo**: Left-aligned, bold text treatment
- **Nav items**: Center-aligned, clean text links with hover states
- **CTA button**: Right-aligned primary button with subtle border

### Hero Section
- **Layout**: Full viewport height with centered content
- **Headline**: Extra large (text-5xl to text-6xl), bold, high contrast
- **Subheadline**: Medium size (text-xl), muted color for hierarchy
- **Search component**: Large, prominent, centered with rounded corners
- **Visual elements**: Custom illustrations or abstract decorative shapes
- **Background**: Soft gradient or solid neutral color

### Search/Analysis Component
- **Container**: Large rounded white card with subtle shadow
- **Input**: Generous padding, clear placeholder text
- **Button**: High contrast, vibrant color, clear label
- **Helper text**: Small text below ("No credit card required" messaging)
- **States**: Loading spinner, validation feedback, smooth transitions

## Typography System
- **Primary Font**: Inter (Google Fonts) - exceptional readability for data-dense interfaces
- **Headings**: Font weights 700 (main headings), 600 (section headers), 500 (card titles)
- **Body Text**: Font weight 400, line-height 1.6 for optimal scanning
- **Data/Metrics**: Font weight 600-700, larger sizes (text-3xl to text-5xl) for prominence
- **Hierarchy**: 
  - Hero/Page Title: text-4xl/text-5xl
  - Section Headers: text-2xl/text-3xl  
  - Card Titles: text-lg/text-xl
  - Body: text-base
  - Metadata/Labels: text-sm/text-xs

## Layout System
**Spacing Primitives**: Tailwind units 2, 4, 6, 8, 12, 16, 20
- Component padding: p-6 to p-8
- Section spacing: mb-8 to mb-12
- Card gaps: gap-6 to gap-8
- Container max-width: max-w-7xl (dashboard), max-w-3xl (input forms)

## Component Library

### Input Section
- **URL Input Card**: Centered, elevated card (shadow-lg) with generous padding (p-8)
- Input field with clear label, helper text explaining what happens
- Prominent CTA button with loading states
- Example URLs shown below for guidance

### Dashboard Layout
- **Top Stats Bar**: 4-column grid (grid-cols-4) showing key metrics - Overall Score, Mention Rate, Competitor Position, Platform Average
- Each metric card: Large number (text-4xl, font-bold), small label below, subtle background
- **Main Content**: 2-column layout (grid-cols-1 lg:grid-cols-3)
  - Left column (col-span-2): Primary charts and analysis
  - Right column (col-span-1): Competitor sidebar, quick insights

### Data Visualization Components
- **Score Displays**: Circular progress rings or horizontal bar charts for 0-100 scores
- **Platform Comparison**: Horizontal bar chart comparing performance across ChatGPT, Claude, Gemini, Perplexity
- **Competitor Rankings**: Ordered list cards with rank badges, scores, and comparison arrows
- **Dimension Breakdown**: 6-category radar/spider chart showing mention rate, context quality, sentiment, prominence, competitor comparison, recommendation likelihood

### Content Cards
- Consistent card pattern: rounded-lg, border, p-6, subtle shadow on hover
- **Analysis Cards**: Icon + title + detailed bullet points
- **Recommendation Cards**: Warning/info/success icons, actionable headline, specific steps listed
- **Gap Detection Cards**: Highlighted missing elements with priority badges (High/Medium/Low)

### Navigation
- Top navigation bar: Logo left, "New Analysis" button right
- Breadcrumb trail when viewing analysis results
- Sticky header on scroll

## Interaction Patterns
- **Loading States**: Skeleton screens for data loading, progress indicators for analysis
- **Hover Effects**: Subtle scale (scale-105) on cards, underline on links
- **Tooltips**: Information icons next to metrics with explanatory tooltips
- **Expandable Sections**: Accordion pattern for detailed recommendations

## Data Presentation Principles
- **Numbers First**: Lead with the metric, explanation follows
- **Visual Encoding**: Use progress bars, badges, and icons to make scores scannable
- **Comparison Context**: Always show competitor benchmarks alongside brand scores
- **Actionable Focus**: Every insight paired with clear next steps

## Images
- **Dashboard Hero**: Not applicable - dashboard leads with data, no hero section needed
- **Empty States**: Illustration when no analysis exists yet - modern line art showing AI/analytics concept, centered in card
- **Icons**: Heroicons throughout for consistency - use outline style for navigation, solid for badges/indicators

## Accessibility
- High contrast ratios for all text (4.5:1 minimum)
- Clear focus indicators on interactive elements (ring-2 ring-offset-2)
- Screen reader labels for all data visualizations
- Keyboard navigation for all interactive components
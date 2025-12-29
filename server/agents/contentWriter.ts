// Agent 7: Writer Agent
// Generates AI-search-optimized content designed to be cited by AI engines

import { analyzeWithGPT } from '../services/openai';
import type { ContentRecommendation, GeneratedContent, GEOAnalysisRequest } from './types';

export async function generateContent(
    recommendation: ContentRecommendation,
    request: GEOAnalysisRequest
): Promise<GeneratedContent> {
    const { brand, industry, market = 'India' } = request;

    let prompt: string;

    switch (recommendation.type) {
        case 'comparison_page':
            prompt = generateComparisonPrompt(recommendation, brand, industry);
            break;
        case 'blog':
            prompt = generateBlogPrompt(recommendation, brand, industry, market);
            break;
        case 'faq':
            prompt = generateFAQPrompt(recommendation, brand, industry);
            break;
        case 'landing_page':
            prompt = generateLandingPagePrompt(recommendation, brand, industry);
            break;
        default:
            prompt = generateBlogPrompt(recommendation, brand, industry, market);
    }

    const content = await analyzeWithGPT(prompt, {
        systemPrompt: `You are an expert content writer specializing in AI-optimized content. 
Your content is designed to be cited by AI search engines like ChatGPT, Claude, and Perplexity.

Guidelines:
- Write factually and neutrally
- Use clear definitions and structured formatting
- Include bullet points, numbered lists, and headers
- Be comprehensive but concise
- Mention brands naturally, not forced
- Focus on providing value to readers`,
        temperature: 0.7,
    });

    // Calculate metadata
    const wordCount = content.split(/\s+/).length;
    const readingTime = `${Math.ceil(wordCount / 200)} min read`;
    const targetKeywords = extractKeywords(recommendation.targetQuery, brand, industry);

    return {
        title: recommendation.title,
        content,
        type: recommendation.type,
        metadata: {
            wordCount,
            readingTime,
            targetKeywords,
        },
    };
}

function generateComparisonPrompt(
    recommendation: ContentRecommendation,
    brand: string,
    industry: string
): string {
    return `Write a comprehensive comparison article for "${recommendation.title}".

Target query: "${recommendation.targetQuery}"
Industry: ${industry}
Brand to feature: ${brand}

Structure:
1. Brief introduction (what users are comparing)
2. Quick comparison table (features, pricing tiers, best for)
3. Detailed comparison by category:
   - Features & Capabilities
   - Pricing & Value
   - Ease of Use
   - Customer Support
   - Integration Options
4. Use case recommendations (when to choose each)
5. Verdict section

Guidelines:
- Be fair and objective
- Highlight genuine strengths of each option
- Include specific features and data points
- Write in markdown format
- Keep it under 1500 words`;
}

function generateBlogPrompt(
    recommendation: ContentRecommendation,
    brand: string,
    industry: string,
    market: string
): string {
    return `Write a comprehensive blog post: "${recommendation.title}".

Target query: "${recommendation.targetQuery}"
Industry: ${industry}
Market focus: ${market}
Brand to mention: ${brand} (mention naturally, don't force)

Structure:
1. Introduction explaining what readers will learn
2. Criteria for evaluating ${industry} options
3. Overview of top options (including ${brand})
4. Detailed analysis of each option:
   - Key features
   - Pros and cons
   - Best use cases
   - Pricing overview
5. How to choose the right option
6. Conclusion with recommendations

Guidelines:
- Be helpful and informative
- Include specific, verifiable facts
- Use headers, bullet points, and tables
- Write in markdown format
- Keep it under 2000 words`;
}

function generateFAQPrompt(
    recommendation: ContentRecommendation,
    brand: string,
    industry: string
): string {
    return `Create a comprehensive FAQ page: "${recommendation.title}".

Target query: "${recommendation.targetQuery}"
Industry: ${industry}
Brand to include: ${brand}

Generate 10-15 frequently asked questions covering:
1. What is questions (definitions)
2. How to questions (practical guidance)
3. Comparison questions (vs other options)
4. Cost/pricing questions
5. Implementation/setup questions
6. Feature-specific questions

Format each FAQ as:
## Q: [Question]
[Clear, comprehensive answer in 2-3 paragraphs]

Guidelines:
- Answers should be factual and complete
- Include specific details and examples
- Mention ${brand} naturally where relevant
- Use markdown formatting
- Each answer should be self-contained`;
}

function generateLandingPagePrompt(
    recommendation: ContentRecommendation,
    brand: string,
    industry: string
): string {
    return `Write content for a landing page: "${recommendation.title}".

Target query: "${recommendation.targetQuery}"
Industry: ${industry}
Brand: ${brand}

Structure:
1. Hero section headline and value proposition
2. Problem statement (pain points)
3. Solution overview (how ${brand} helps)
4. Key features (5-7 with descriptions)
5. Benefits section (business outcomes)
6. Social proof section (testimonial placeholders)
7. Use cases / who it's for
8. Getting started section
9. FAQ section (5 questions)
10. Call to action

Guidelines:
- Focus on benefits, not just features
- Be specific about outcomes
- Use persuasive but honest language
- Write in markdown format
- Keep it scannable with headers and bullets`;
}

function extractKeywords(query: string, brand: string, industry: string): string[] {
    const keywords = new Set<string>();

    // Add industry and brand
    keywords.add(industry.toLowerCase());
    keywords.add(brand.toLowerCase().replace('.com', ''));

    // Extract words from query
    const words = query.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'is', 'are', 'for', 'in', 'to', 'of', 'and', 'or'];

    for (const word of words) {
        if (word.length > 3 && !stopWords.includes(word)) {
            keywords.add(word);
        }
    }

    return Array.from(keywords).slice(0, 10);
}

export async function generateMultipleContents(
    recommendations: ContentRecommendation[],
    request: GEOAnalysisRequest,
    limit: number = 3
): Promise<GeneratedContent[]> {
    const contents: GeneratedContent[] = [];

    // Process only top priority recommendations
    const topRecommendations = recommendations.slice(0, limit);

    for (const rec of topRecommendations) {
        try {
            const content = await generateContent(rec, request);
            contents.push(content);
        } catch (error) {
            console.error(`Failed to generate content for: ${rec.title}`, error);
        }
    }

    return contents;
}

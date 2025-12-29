// Agent 8: Auto-Publishing Agent
// Publishes AI-optimized content to CMS in clean, structured format

import type { GEOAnalysisRequest } from './types';

// ==================== Types ====================

export interface StructuredContent {
    definition: string;
    decisionFramework: string[];
    brandPositioning: string;
    competitorContext: string;
    faqs: Array<{
        question: string;
        answer: string;
    }>;
    aiSummary: string[];
}

export interface PublishRequest {
    cmsType: 'wordpress';
    publishMode: 'draft' | 'publish';
    targetQuery: string;
    brand: string;
    content: StructuredContent;
    credentials?: {
        siteUrl: string;
        username: string;
        applicationPassword: string;
    };
}

export interface PublishResult {
    status: 'published' | 'failed';
    cms?: string;
    postUrl?: string;
    postId?: string;
    query?: string;
    reason?: string;
}

// ==================== Content Formatting ====================

/**
 * Format structured content into semantic HTML for WordPress
 */
export function formatContentToHTML(content: StructuredContent, query: string, brand: string): string {
    const html: string[] = [];

    // Introduction / Definition
    html.push(`<h2>What You Need to Know</h2>`);
    html.push(`<p>${escapeHtml(content.definition)}</p>`);

    // Decision Framework
    if (content.decisionFramework.length > 0) {
        html.push(`<h2>How to Choose the Right Solution</h2>`);
        html.push(`<ul>`);
        for (const point of content.decisionFramework) {
            html.push(`<li>${escapeHtml(point)}</li>`);
        }
        html.push(`</ul>`);
    }

    // Brand Positioning
    if (content.brandPositioning) {
        html.push(`<h2>About ${escapeHtml(brand)}</h2>`);
        html.push(`<p>${escapeHtml(content.brandPositioning)}</p>`);
    }

    // Competitor Context
    if (content.competitorContext) {
        html.push(`<h2>Market Landscape</h2>`);
        html.push(`<p>${escapeHtml(content.competitorContext)}</p>`);
    }

    // FAQ Section (Schema-ready format)
    if (content.faqs.length > 0) {
        html.push(`<h2>Frequently Asked Questions</h2>`);
        for (const faq of content.faqs) {
            html.push(`<h3>${escapeHtml(faq.question)}</h3>`);
            html.push(`<p>${escapeHtml(faq.answer)}</p>`);
        }
    }

    // AI Summary Section
    if (content.aiSummary.length > 0) {
        html.push(`<h2>Key Takeaways</h2>`);
        html.push(`<ul>`);
        for (const point of content.aiSummary) {
            html.push(`<li>${escapeHtml(point)}</li>`);
        }
        html.push(`</ul>`);
    }

    return html.join('\n');
}

/**
 * Generate title from target query
 */
export function generateTitle(query: string, brand: string): string {
    // Clean up and format the query as a title
    let title = query.trim();

    // Capitalize first letter of each word
    title = title.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    // Add year if about "best" or "top"
    if (title.toLowerCase().includes('best') || title.toLowerCase().includes('top')) {
        const year = new Date().getFullYear();
        if (!title.includes(String(year))) {
            title = `${title} (${year} Guide)`;
        }
    }

    return title;
}

/**
 * Generate clean slug from title
 */
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 60);
}

/**
 * Generate meta description
 */
export function generateMetaDescription(content: StructuredContent, query: string): string {
    // Take first 155 characters of definition, clean for meta
    let description = content.definition
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (description.length > 155) {
        description = description.substring(0, 152) + '...';
    }

    return description;
}

// ==================== WordPress Publishing ====================

/**
 * Publish content to WordPress via REST API
 */
export async function publishToWordPress(request: PublishRequest): Promise<PublishResult> {
    // Safety check: credentials must be provided
    if (!request.credentials) {
        return {
            status: 'failed',
            reason: 'WordPress credentials not provided. Set siteUrl, username, and applicationPassword.',
        };
    }

    const { siteUrl, username, applicationPassword } = request.credentials;

    if (!siteUrl || !username || !applicationPassword) {
        return {
            status: 'failed',
            reason: 'Incomplete WordPress credentials. Need siteUrl, username, and applicationPassword.',
        };
    }

    try {
        // Format content
        const htmlContent = formatContentToHTML(request.content, request.targetQuery, request.brand);
        const title = generateTitle(request.targetQuery, request.brand);
        const slug = generateSlug(title);

        // Prepare API request
        const apiUrl = `${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`;

        const postData = {
            title,
            content: htmlContent,
            slug,
            status: request.publishMode,
            excerpt: generateMetaDescription(request.content, request.targetQuery),
        };

        // Make API call
        const authHeader = `Basic ${Buffer.from(`${username}:${applicationPassword}`).toString('base64')}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify(postData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                status: 'failed',
                reason: `WordPress API error: ${response.status} - ${errorText}`,
            };
        }

        const result = await response.json();

        return {
            status: 'published',
            cms: 'wordpress',
            postUrl: result.link || '',
            postId: String(result.id || ''),
            query: request.targetQuery,
        };
    } catch (error) {
        return {
            status: 'failed',
            reason: `Publishing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

/**
 * Main auto-publish function
 */
export async function autoPublish(request: PublishRequest): Promise<PublishResult> {
    console.log(`[AutoPublish] Starting publish for query: "${request.targetQuery}"`);

    // Currently only WordPress is supported
    if (request.cmsType !== 'wordpress') {
        return {
            status: 'failed',
            reason: `CMS type "${request.cmsType}" is not supported. Currently only "wordpress" is available.`,
        };
    }

    const result = await publishToWordPress(request);

    if (result.status === 'published') {
        console.log(`[AutoPublish] Successfully published to ${result.postUrl}`);
    } else {
        console.log(`[AutoPublish] Failed: ${result.reason}`);
    }

    return result;
}

// ==================== Helpers ====================

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Preview formatted content without publishing
 */
export function previewPublishContent(
    content: StructuredContent,
    query: string,
    brand: string
): {
    title: string;
    slug: string;
    metaDescription: string;
    htmlContent: string;
} {
    const title = generateTitle(query, brand);

    return {
        title,
        slug: generateSlug(title),
        metaDescription: generateMetaDescription(content, query),
        htmlContent: formatContentToHTML(content, query, brand),
    };
}

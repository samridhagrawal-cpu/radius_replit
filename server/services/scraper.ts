import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import https from 'https';

export interface WebsiteInfo {
  url: string;
  title: string;
  description: string;
  headings: string[];
  textContent: string;
  links: string[];
  hasFAQ: boolean;
  hasTestimonials: boolean;
  hasPricing: boolean;
  hasAbout: boolean;
  hasBlog: boolean;
  hasComparisons: boolean;
  hasUseCases: boolean;
  hasDocumentation: boolean;
  metaTags: Record<string, string>;
  htmlSize: number;
}

export async function scrapeWebsite(url: string): Promise<WebsiteInfo> {
  try {
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Create HTTPS agent that ignores SSL certificate errors
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
    
    let response;
    try {
      response = await fetch(fullUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Radius/1.0; +https://radius.ai)',
        },
        agent: fullUrl.startsWith('https') ? httpsAgent : undefined,
      });
    } catch (fetchError: any) {
      // Provide user-friendly error messages for common issues
      if (fetchError.code === 'ENOTFOUND') {
        throw new Error(`Domain not found: ${fullUrl}. Please check the URL and try again.`);
      } else if (fetchError.code === 'ETIMEDOUT' || fetchError.type === 'request-timeout') {
        throw new Error(`Request timeout: ${fullUrl} took too long to respond. Please try again later.`);
      } else {
        throw fetchError;
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Debug: Log what we scraped for SSL sites
    console.log('Scraper Debug:', {
      url: fullUrl,
      htmlLength: html.length,
      title: $('title').text() || 'NO TITLE',
      h1Count: $('h1').length,
      h2Count: $('h2').length,
      bodyTextLength: $('body').text().length
    });

    // Extract basic info
    const title = $('title').text() || $('h1').first().text() || 'Untitled';
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || 
                       '';

    // Extract headings
    const headings: string[] = [];
    $('h1, h2, h3').each((_, el) => {
      const text = $(el).text().trim();
      if (text) headings.push(text);
    });

    // Extract text content (sample)
    const textContent = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 5000);

    // Extract links
    const links: string[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) links.push(href);
    });

    // Detect content types
    const pageText = textContent.toLowerCase();
    const allLinks = links.map(l => l.toLowerCase()).join(' ');
    const allHeadings = headings.map(h => h.toLowerCase()).join(' ');

    const hasFAQ = pageText.includes('faq') || 
                   pageText.includes('frequently asked') ||
                   allLinks.includes('faq') ||
                   allHeadings.includes('faq');

    const hasTestimonials = pageText.includes('testimonial') || 
                           pageText.includes('customer review') ||
                           pageText.includes('what our customers') ||
                           allLinks.includes('testimonial');

    const hasPricing = pageText.includes('pricing') || 
                      pageText.includes('plans') ||
                      allLinks.includes('pricing') ||
                      allHeadings.includes('pricing');

    const hasAbout = allLinks.includes('about') || 
                    allHeadings.includes('about us');

    const hasBlog = allLinks.includes('blog') || 
                   allLinks.includes('articles') ||
                   allHeadings.includes('blog');

    const hasComparisons = pageText.includes('vs ') || 
                          pageText.includes('compare') ||
                          pageText.includes('alternative') ||
                          allLinks.includes('comparison');

    const hasUseCases = pageText.includes('use case') || 
                       pageText.includes('how to use') ||
                       allHeadings.includes('use case');

    const hasDocumentation = allLinks.includes('docs') || 
                            allLinks.includes('documentation') ||
                            allLinks.includes('api');

    // Extract meta tags
    const metaTags: Record<string, string> = {};
    $('meta').each((_, el) => {
      const name = $(el).attr('name') || $(el).attr('property');
      const content = $(el).attr('content');
      if (name && content) {
        metaTags[name] = content;
      }
    });

    return {
      url: fullUrl,
      title,
      description,
      headings,
      textContent,
      links,
      hasFAQ,
      hasTestimonials,
      hasPricing,
      hasAbout,
      hasBlog,
      hasComparisons,
      hasUseCases,
      hasDocumentation,
      metaTags,
      htmlSize: html.length,
    };
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(`Failed to scrape website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

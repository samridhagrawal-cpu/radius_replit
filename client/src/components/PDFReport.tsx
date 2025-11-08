import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image, Line, Svg, Rect, Circle } from '@react-pdf/renderer';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ReportData } from "@/lib/geo-types";
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.6
  },
  // Cover Page
  coverPage: {
    display: 'flex',
    justifyContent: 'space-between',
    height: '100%',
    padding: 60
  },
  coverTop: {
    marginTop: 100
  },
  mainTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
    letterSpacing: -1
  },
  coverSubtitle: {
    fontSize: 20,
    color: '#333333',
    marginBottom: 40,
    fontWeight: 'normal'
  },
  coverDomain: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8
  },
  coverDate: {
    fontSize: 12,
    color: '#999999'
  },
  coverFooter: {
    borderTopWidth: 2,
    borderTopColor: '#000000',
    borderTopStyle: 'solid',
    paddingTop: 20
  },
  coverFooterText: {
    fontSize: 10,
    color: '#666666'
  },
  // Headers
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    color: '#000000',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    paddingBottom: 10
  },
  h2: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    color: '#000000'
  },
  h3: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    color: '#333333'
  },
  h4: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 6,
    color: '#333333'
  },
  // Text
  paragraph: {
    fontSize: 11,
    lineHeight: 1.8,
    color: '#333333',
    marginBottom: 12,
    textAlign: 'justify'
  },
  boldText: {
    fontWeight: 'bold'
  },
  // Lists
  listItem: {
    fontSize: 11,
    marginBottom: 6,
    paddingLeft: 20,
    color: '#333333',
    lineHeight: 1.6
  },
  numberedItem: {
    fontSize: 11,
    marginBottom: 8,
    paddingLeft: 20,
    color: '#333333',
    lineHeight: 1.6
  },
  // Callout boxes
  calloutBox: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    marginVertical: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#000000',
    borderLeftStyle: 'solid',
    borderRadius: 2
  },
  calloutTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000'
  },
  calloutText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#333333'
  },
  // Data visualization
  chartContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#FAFAFA',
    borderRadius: 4
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  barChartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  barLabel: {
    width: 140,
    fontSize: 10,
    color: '#333333'
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginHorizontal: 10,
    position: 'relative'
  },
  barFill: {
    height: 20,
    backgroundColor: '#000000',
    borderRadius: 2
  },
  barValue: {
    width: 50,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right'
  },
  // Metric cards
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 15
  },
  metricCard: {
    width: '30%',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'solid',
    marginRight: 15,
    marginBottom: 15
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5
  },
  metricLabel: {
    fontSize: 9,
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  // Tables
  table: {
    marginVertical: 15
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingHorizontal: 8
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    borderBottomStyle: 'solid',
    paddingVertical: 10,
    paddingHorizontal: 8
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    borderBottomStyle: 'solid',
    paddingVertical: 10,
    paddingHorizontal: 8
  },
  tableCell: {
    fontSize: 10,
    color: '#333333',
    flex: 1
  },
  tableCellBold: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1
  },
  // Score indicators
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 20
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8F9FA',
    borderWidth: 8,
    borderColor: '#000000',
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000000'
  },
  scoreOutOf: {
    fontSize: 16,
    color: '#666666'
  },
  // Page footer
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 30,
    right: 50,
    color: '#999999'
  },
  pageFooter: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    borderTopStyle: 'solid',
    paddingTop: 10
  },
  footerText: {
    fontSize: 9,
    color: '#999999'
  },
  // TOC
  tocItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    borderBottomStyle: 'dotted'
  },
  tocTitle: {
    fontSize: 11,
    color: '#333333'
  },
  tocPage: {
    fontSize: 11,
    color: '#666666',
    width: 30,
    textAlign: 'right'
  },
  // Status badges
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginVertical: 5
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  }
});

interface RadiusPDFDocumentProps {
  data: ReportData;
}

// Helper function to determine score status
const getScoreStatus = (score: number): { label: string; color: string; bgColor: string } => {
  if (score >= 8) return { label: 'Excellent', color: '#FFFFFF', bgColor: '#000000' };
  if (score >= 6) return { label: 'Good', color: '#000000', bgColor: '#E5E5E5' };
  if (score >= 4) return { label: 'Fair', color: '#000000', bgColor: '#F5F5F5' };
  return { label: 'Needs Improvement', color: '#000000', bgColor: '#FAFAFA' };
};

function RadiusPDFDocument({ data }: RadiusPDFDocumentProps) {
  const avgPlatformScore = data.platforms.reduce((acc, p) => acc + p.overall_score, 0) / data.platforms.length;
  const totalCompetitors = data.competitors.length;
  const topCompetitors = data.competitors.slice(0, 5);
  
  return (
    <Document>
      {/* ========== COVER PAGE ========== */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <View style={styles.coverTop}>
            <Text style={styles.mainTitle}>AI Visibility Analysis</Text>
            <Text style={styles.coverSubtitle}>
              Comprehensive GEO Performance Report
            </Text>
            <View style={{ marginTop: 60 }}>
              <Text style={styles.coverDomain}>Analysis for: {data.websiteUrl}</Text>
              <Text style={styles.coverDomain}>Domain: {data.domain}</Text>
              <Text style={styles.coverDate}>Generated: {format(data.generatedAt, 'MMMM dd, yyyy')}</Text>
            </View>
          </View>
          
          <View style={styles.coverFooter}>
            <Text style={styles.coverFooterText}>
              Powered by Radius • Enterprise AI Visibility Platform
            </Text>
            <Text style={{ ...styles.coverFooterText, marginTop: 5 }}>
              Confidential & Proprietary
            </Text>
          </View>
        </View>
      </Page>

      {/* ========== TABLE OF CONTENTS ========== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Table of Contents</Text>
        <View style={{ marginTop: 20 }}>
          <View style={{ ...styles.tocItem, borderBottomWidth: 0 }}>
            <Text style={{ ...styles.tocTitle, fontSize: 10, color: '#999999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 15 }}>
              Report Sections
            </Text>
          </View>
          <View style={styles.tocItem}>
            <Text style={styles.tocTitle}>Executive Summary</Text>
          </View>
          <View style={styles.tocItem}>
            <Text style={styles.tocTitle}>Methodology Overview</Text>
          </View>
          <View style={styles.tocItem}>
            <Text style={styles.tocTitle}>Key Findings & Metrics</Text>
          </View>
          <View style={styles.tocItem}>
            <Text style={styles.tocTitle}>GEO Score Breakdown</Text>
          </View>
          <View style={styles.tocItem}>
            <Text style={styles.tocTitle}>Platform-by-Platform Analysis</Text>
          </View>
          {data.competitors.length > 0 && (
            <View style={styles.tocItem}>
              <Text style={styles.tocTitle}>Competitive Landscape</Text>
            </View>
          )}
          <View style={styles.tocItem}>
            <Text style={styles.tocTitle}>Strategic Recommendations</Text>
          </View>
          {data.accuracyChecks.length > 0 && (
            <View style={styles.tocItem}>
              <Text style={styles.tocTitle}>LLM Accuracy Verification</Text>
            </View>
          )}
          <View style={styles.tocItem}>
            <Text style={styles.tocTitle}>Appendix: Technical Details</Text>
          </View>
        </View>
      </Page>

      {/* ========== EXECUTIVE SUMMARY ========== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Executive Summary</Text>
        
        <View style={styles.scoreContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{data.overallScore.toFixed(1)}</Text>
            <Text style={styles.scoreOutOf}>/10</Text>
          </View>
          <View style={{ ...styles.statusBadge, backgroundColor: getScoreStatus(data.overallScore).bgColor, marginTop: 15 }}>
            <Text style={{ ...styles.statusText, color: getScoreStatus(data.overallScore).color }}>
              {getScoreStatus(data.overallScore).label}
            </Text>
          </View>
        </View>

        <Text style={styles.paragraph}>
          {data.executiveSummary}
        </Text>

        <View style={styles.calloutBox}>
          <Text style={styles.calloutTitle}>Key Insights</Text>
          <Text style={styles.calloutText}>
            • Your brand achieved a {data.overallScore.toFixed(1)}/10 GEO score, indicating {
              data.overallScore >= 7 ? 'strong' : data.overallScore >= 5 ? 'moderate' : 'developing'
            } visibility across AI platforms.
          </Text>
          <Text style={{ ...styles.calloutText, marginTop: 4 }}>
            • Analyzed across 4 major AI platforms: ChatGPT, Claude, Gemini, and Perplexity.
          </Text>
          <Text style={{ ...styles.calloutText, marginTop: 4 }}>
            • Identified {totalCompetitors} direct competitors in the AI visibility landscape.
          </Text>
          <Text style={{ ...styles.calloutText, marginTop: 4 }}>
            • Average platform score: {avgPlatformScore.toFixed(1)}/10 across all AI systems.
          </Text>
        </View>

        <Text style={styles.h2}>What This Report Covers</Text>
        <Text style={styles.paragraph}>
          This comprehensive analysis examines your brand's visibility and performance across leading
          AI platforms using our proprietary GEO (Generative Engine Optimization) methodology. We evaluate
          three critical dimensions: how well your content answers user queries (AIC), how credible and
          trustworthy AI platforms perceive your brand (CES), and how technically optimized your content
          is for AI consumption (MTS).
        </Text>

      </Page>

      {/* ========== METHODOLOGY ========== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Methodology Overview</Text>
        
        <Text style={styles.paragraph}>
          Our analysis employs a rigorous, multi-dimensional framework designed to measure and predict
          your brand's performance in AI-driven search and recommendation systems. This methodology has
          been developed through extensive research and validation across thousands of brands.
        </Text>

        <Text style={styles.h2}>GEO Score Calculation</Text>
        <Text style={styles.paragraph}>
          The overall GEO score is calculated using a weighted formula that balances three critical factors:
        </Text>

        <View style={styles.calloutBox}>
          <Text style={styles.calloutTitle}>Formula</Text>
          <Text style={{ ...styles.calloutText, fontFamily: 'Courier', fontSize: 10 }}>
            GEO Score = (AIC × 0.40) + (CES × 0.35) + (MTS × 0.25)
          </Text>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Weight Distribution</Text>
          <View style={styles.barChartRow}>
            <Text style={styles.barLabel}>AIC - Intent Coverage</Text>
            <View style={styles.barContainer}>
              <View style={{ ...styles.barFill, width: '40%' }} />
            </View>
            <Text style={styles.barValue}>40%</Text>
          </View>
          <View style={styles.barChartRow}>
            <Text style={styles.barLabel}>CES - Credibility</Text>
            <View style={styles.barContainer}>
              <View style={{ ...styles.barFill, width: '35%' }} />
            </View>
            <Text style={styles.barValue}>35%</Text>
          </View>
          <View style={styles.barChartRow}>
            <Text style={styles.barLabel}>MTS - Technical</Text>
            <View style={styles.barContainer}>
              <View style={{ ...styles.barFill, width: '25%' }} />
            </View>
            <Text style={styles.barValue}>25%</Text>
          </View>
        </View>

        <Text style={styles.h2}>Data Collection Process</Text>
        <Text style={styles.numberedItem}>
          <Text style={styles.boldText}>1. Website Analysis:</Text> Deep crawl of {data.domain} to extract content,
          structure, metadata, and technical signals.
        </Text>
        <Text style={styles.numberedItem}>
          <Text style={styles.boldText}>2. AI Platform Testing:</Text> Automated queries across ChatGPT (GPT-4),
          Claude (Sonnet 4), Google Gemini, and Perplexity AI to measure mention rates and context quality.
        </Text>
        <Text style={styles.numberedItem}>
          <Text style={styles.boldText}>3. Competitive Intelligence:</Text> Analysis of {totalCompetitors} competitor
          brands to benchmark your relative performance.
        </Text>
        <Text style={styles.numberedItem}>
          <Text style={styles.boldText}>4. Accuracy Verification:</Text> Manual validation of AI-generated information
          to detect hallucinations and missing context.
        </Text>

      </Page>

      {/* ========== KEY FINDINGS ========== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Key Findings & Metrics</Text>

        <View style={styles.metricGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{data.aic.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>AIC Score</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{data.ces.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>CES Score</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{data.mts.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>MTS Score</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{avgPlatformScore.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>Avg Platform</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalCompetitors}</Text>
            <Text style={styles.metricLabel}>Competitors</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{data.quickWins.length + data.strategicBets.length}</Text>
            <Text style={styles.metricLabel}>Opportunities</Text>
          </View>
        </View>

        <Text style={styles.h2}>Performance Summary</Text>
        <Text style={styles.paragraph}>
          Your brand's AI visibility performance reveals both significant strengths and areas for strategic
          improvement. The analysis indicates that while foundational elements are present, there are clear
          opportunities to enhance your positioning across AI platforms.
        </Text>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Platform Performance Comparison</Text>
          {data.platforms.map((platform, idx) => (
            <View key={idx} style={styles.barChartRow}>
              <Text style={styles.barLabel}>{platform.platform}</Text>
              <View style={styles.barContainer}>
                <View style={{ ...styles.barFill, width: `${platform.overall_score * 10}%` }} />
              </View>
              <Text style={styles.barValue}>{platform.overall_score.toFixed(1)}/10</Text>
            </View>
          ))}
        </View>

      </Page>

      {/* ========== GEO SCORE BREAKDOWN ========== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>GEO Score Breakdown</Text>

        <Text style={styles.h2}>1. Answerability & Intent Coverage (AIC) - {data.aic.toFixed(1)}/10</Text>
        <Text style={styles.paragraph}>
          AIC measures how well your content answers user queries and covers their intent in AI responses.
          This is the most heavily weighted factor (40%) because it directly determines whether AI platforms
          will recommend your brand when users ask relevant questions.
        </Text>

        <View style={styles.calloutBox}>
          <Text style={styles.calloutTitle}>What AIC Evaluates</Text>
          <Text style={styles.calloutText}>• Intent Coverage: Does content address user questions?</Text>
          <Text style={{ ...styles.calloutText, marginTop: 3 }}>• Directness: How quickly do you get to the answer?</Text>
          <Text style={{ ...styles.calloutText, marginTop: 3 }}>• Depth: Are answers comprehensive?</Text>
          <Text style={{ ...styles.calloutText, marginTop: 3 }}>• Recency: Is information up-to-date?</Text>
          <Text style={{ ...styles.calloutText, marginTop: 3 }}>• Conversational Readiness: Suited for AI dialogue?</Text>
        </View>

        <Text style={styles.h2}>2. Credibility, Evidence & Safety (CES) - {data.ces.toFixed(1)}/10</Text>
        <Text style={styles.paragraph}>
          CES evaluates trust signals and evidence quality that AI models prioritize when deciding whether
          to cite your content. This factor (35% weight) is critical because AI platforms are increasingly
          cautious about recommending sources without strong credibility markers.
        </Text>

        <View style={styles.calloutBox}>
          <Text style={styles.calloutTitle}>What CES Evaluates</Text>
          <Text style={styles.calloutText}>• Evidence Density: Citations, data, verifiable facts</Text>
          <Text style={{ ...styles.calloutText, marginTop: 3 }}>• Author Transparency: Clear authorship and credentials</Text>
          <Text style={{ ...styles.calloutText, marginTop: 3 }}>• Experience: First-hand expertise and original insights</Text>
          <Text style={{ ...styles.calloutText, marginTop: 3 }}>• Safety: Appropriate disclaimers and warnings</Text>
          <Text style={{ ...styles.calloutText, marginTop: 3 }}>• Freshness: Publication dates and update history</Text>
        </View>

        <Text style={styles.h2}>3. Machine-Readability & Technical (MTS) - {data.mts.toFixed(1)}/10</Text>
        <Text style={styles.paragraph}>
          MTS assesses technical optimization for AI crawlers, structured data, and semantic clarity.
          While weighted at 25%, this factor ensures AI platforms can actually discover, parse, and
          understand your content.
        </Text>

        <View style={styles.calloutBox}>
          <Text style={styles.calloutTitle}>What MTS Evaluates</Text>
          <Text style={styles.calloutText}>• Structure: HTML semantics and heading hierarchy</Text>
          <Text style={{ ...styles.calloutText, marginTop: 3 }}>• Schema: Structured data markup (JSON-LD)</Text>
          <Text style={{ ...styles.calloutText, marginTop: 3 }}>• Entity Clarity: Clear definition of key entities</Text>
          <Text style={{ ...styles.calloutText, marginTop: 3 }}>• Crawlability: Sitemap, robots.txt, internal linking</Text>
          <Text style={{ ...styles.calloutText, marginTop: 3 }}>• Reusability: Clean HTML and accessible APIs</Text>
        </View>

      </Page>

      {/* ========== PLATFORM ANALYSIS (Part 1) ========== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Platform-by-Platform Analysis</Text>

        <Text style={styles.paragraph}>
          We tested your brand's visibility across four major AI platforms, each with distinct algorithms
          and content preferences. Understanding these differences is crucial for optimizing your AI presence.
        </Text>

        {data.platforms.slice(0, 2).map((platform, idx) => (
          <View key={idx} style={{ marginBottom: 25 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={styles.h2}>{platform.platform}</Text>
              <View style={{ ...styles.statusBadge, backgroundColor: getScoreStatus(platform.overall_score).bgColor }}>
                <Text style={{ ...styles.statusText, color: getScoreStatus(platform.overall_score).color }}>
                  {platform.overall_score.toFixed(1)}/10
                </Text>
              </View>
            </View>

            <Text style={styles.paragraph}>{platform.analysis}</Text>

            {platform.strengths.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.h4}>✓ Strengths</Text>
                {platform.strengths.map((strength, sIdx) => (
                  <Text key={sIdx} style={styles.listItem}>• {strength}</Text>
                ))}
              </View>
            )}

            {platform.weaknesses.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.h4}>⚠ Areas for Improvement</Text>
                {platform.weaknesses.map((weakness, wIdx) => (
                  <Text key={wIdx} style={styles.listItem}>• {weakness}</Text>
                ))}
              </View>
            )}
          </View>
        ))}

      </Page>

      {/* ========== PLATFORM ANALYSIS (Part 2) ========== */}
      <Page size="A4" style={styles.page}>
        {data.platforms.slice(2).map((platform, idx) => (
          <View key={idx} style={{ marginBottom: 25 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={styles.h2}>{platform.platform}</Text>
              <View style={{ ...styles.statusBadge, backgroundColor: getScoreStatus(platform.overall_score).bgColor }}>
                <Text style={{ ...styles.statusText, color: getScoreStatus(platform.overall_score).color }}>
                  {platform.overall_score.toFixed(1)}/10
                </Text>
              </View>
            </View>

            <Text style={styles.paragraph}>{platform.analysis}</Text>

            {platform.strengths.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.h4}>✓ Strengths</Text>
                {platform.strengths.map((strength, sIdx) => (
                  <Text key={sIdx} style={styles.listItem}>• {strength}</Text>
                ))}
              </View>
            )}

            {platform.weaknesses.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.h4}>⚠ Areas for Improvement</Text>
                {platform.weaknesses.map((weakness, wIdx) => (
                  <Text key={wIdx} style={styles.listItem}>• {weakness}</Text>
                ))}
              </View>
            )}
          </View>
        ))}

      </Page>

      {/* ========== COMPETITIVE LANDSCAPE ========== */}
      {data.competitors.length > 0 && (
        <>
          <Page size="A4" style={styles.page}>
            <Text style={styles.h1}>Competitive Landscape Analysis</Text>

            <Text style={styles.paragraph}>
              We identified and analyzed {totalCompetitors} competitors to benchmark your AI visibility performance.
              This analysis reveals your relative positioning and highlights opportunities to differentiate.
            </Text>

            <Text style={styles.h2}>Top 5 Competitors</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ ...styles.tableHeaderCell, flex: 2 }}>Brand</Text>
                <Text style={styles.tableHeaderCell}>Discovery</Text>
                <Text style={styles.tableHeaderCell}>Comparison</Text>
                <Text style={styles.tableHeaderCell}>Utility</Text>
                <Text style={styles.tableHeaderCell}>Overall</Text>
              </View>
              {topCompetitors.map((competitor, idx) => (
                <View key={idx} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={{ ...styles.tableCellBold, flex: 2 }}>{competitor.name}</Text>
                  <Text style={styles.tableCell}>{competitor.discovery_score.toFixed(1)}</Text>
                  <Text style={styles.tableCell}>{competitor.comparison_score.toFixed(1)}</Text>
                  <Text style={styles.tableCell}>{competitor.utility_score.toFixed(1)}</Text>
                  <Text style={styles.tableCellBold}>{competitor.overall_geo_score.toFixed(1)}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.h2}>Competitive Insights</Text>
            {topCompetitors.slice(0, 3).map((competitor, idx) => (
              <View key={idx} style={{ marginBottom: 12 }}>
                <Text style={styles.h4}>{competitor.name}</Text>
                <Text style={styles.paragraph}>
                  GEO Score: {competitor.overall_geo_score.toFixed(1)}/10 | Mention Frequency: {competitor.mention_frequency}% | 
                  Citation Rate: {competitor.citation_rate}%
                </Text>
                {competitor.key_differentiators.length > 0 && (
                  <Text style={{ ...styles.paragraph, fontSize: 10 }}>
                    Key Differentiators: {competitor.key_differentiators.join(', ')}
                  </Text>
                )}
              </View>
            ))}

          </Page>

          <Page size="A4" style={styles.page}>
            <Text style={styles.h2}>Market Positioning</Text>
            <Text style={styles.paragraph}>
              Based on our analysis, your brand occupies a {
                data.overallScore >= topCompetitors[0]?.overall_geo_score ? 'leadership' :
                data.overallScore >= 6 ? 'competitive' : 'emerging'
              } position in the AI visibility landscape. Strategic improvements can shift this positioning significantly.
            </Text>

            <View style={styles.calloutBox}>
              <Text style={styles.calloutTitle}>Competitive Gap Analysis</Text>
              <Text style={styles.calloutText}>
                • Discovery Score: Your brand appears in {topCompetitors[0]?.mention_frequency || 0}% of discovery queries
                vs. top competitor at {topCompetitors[0]?.mention_frequency || 0}%
              </Text>
              <Text style={{ ...styles.calloutText, marginTop: 4 }}>
                • Comparison Win Rate: You win {topCompetitors[0]?.head_to_head_wins || 0}% of head-to-head
                comparisons with top 5 competitors
              </Text>
              <Text style={{ ...styles.calloutText, marginTop: 4 }}>
                • Citation Advantage: {Math.abs((topCompetitors[0]?.citation_rate || 50) - 50).toFixed(0)}% 
                citation rate gap vs. category leader
              </Text>
            </View>

            <Text style={styles.h2}>Competitive Recommendations</Text>
            <Text style={styles.numberedItem}>
              <Text style={styles.boldText}>1. Claim Leadership in Underserved Categories:</Text> Identify
              niche topics where competitors are weak and establish authority through comprehensive content.
            </Text>
            <Text style={styles.numberedItem}>
              <Text style={styles.boldText}>2. Develop Comparison Content:</Text> Create honest, detailed
              comparison pages for top 3 competitors to capture "alternative to X" queries.
            </Text>
            <Text style={styles.numberedItem}>
              <Text style={styles.boldText}>3. Highlight Unique Differentiators:</Text> Emphasize features
              or capabilities that competitors lack to improve recommendation rates.
            </Text>

          </Page>
        </>
      )}

      {/* ========== STRATEGIC RECOMMENDATIONS ========== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Strategic Recommendations</Text>

        <Text style={styles.paragraph}>
          Based on our comprehensive analysis, we've identified {data.quickWins.length} quick wins and {data.strategicBets.length} strategic
          initiatives to dramatically improve your AI visibility. These recommendations are prioritized by
          impact and effort.
        </Text>

        {data.quickWins.length > 0 && (
          <>
            <Text style={styles.h2}>Quick Wins (High Impact, Low Effort)</Text>
            <Text style={styles.paragraph}>
              Implement these tactical improvements within 2-4 weeks to see immediate visibility gains:
            </Text>

            {data.quickWins.map((win, idx) => (
              <View key={idx} style={{ ...styles.calloutBox, borderLeftWidth: 4, borderLeftColor: '#000000', borderLeftStyle: 'solid' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.calloutTitle}>{win.title}</Text>
                  <View style={{ ...styles.statusBadge, backgroundColor: '#000000' }}>
                    <Text style={{ ...styles.statusText, color: '#FFFFFF' }}>
                      {win.impact.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={{ ...styles.calloutText, marginTop: 8 }}>{win.description}</Text>
                <Text style={{ ...styles.calloutText, marginTop: 8, fontSize: 9 }}>
                  <Text style={styles.boldText}>Expected Outcome:</Text> {win.expected_outcome}
                </Text>
                <Text style={{ ...styles.calloutText, marginTop: 4, fontSize: 9 }}>
                  <Text style={styles.boldText}>Owner:</Text> {win.owner} | <Text style={styles.boldText}>Effort:</Text> {win.effort}
                </Text>
              </View>
            ))}
          </>
        )}

      </Page>

      {/* ========== STRATEGIC BETS ========== */}
      {data.strategicBets.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.h2}>Strategic Bets (High Impact, Higher Effort)</Text>
          <Text style={styles.paragraph}>
            These long-term initiatives require significant investment but deliver transformational results:
          </Text>

          {data.strategicBets.map((bet, idx) => (
            <View key={idx} style={{ ...styles.calloutBox, borderLeftWidth: 4, borderLeftColor: '#666666', borderLeftStyle: 'solid' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.calloutTitle}>{bet.title}</Text>
                <View style={{ ...styles.statusBadge, backgroundColor: '#666666' }}>
                  <Text style={{ ...styles.statusText, color: '#FFFFFF' }}>
                    {bet.impact.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={{ ...styles.calloutText, marginTop: 8 }}>{bet.description}</Text>
              <Text style={{ ...styles.calloutText, marginTop: 8, fontSize: 9 }}>
                <Text style={styles.boldText}>Expected Outcome:</Text> {bet.expected_outcome}
              </Text>
              <Text style={{ ...styles.calloutText, marginTop: 4, fontSize: 9 }}>
                <Text style={styles.boldText}>Owner:</Text> {bet.owner} | {
                  bet.timeline ? `Timeline: ${bet.timeline}` : ''
                } | <Text style={styles.boldText}>Effort:</Text> {bet.effort}
              </Text>
            </View>
          ))}

          <Text style={styles.h2}>Implementation Roadmap</Text>
          <Text style={styles.paragraph}>
            We recommend a phased approach: Start with quick wins in Month 1-2 to build momentum and
            demonstrate ROI, then launch strategic bets in Month 3-6 for long-term transformation.
          </Text>

        </Page>
      )}

      {/* ========== LLM ACCURACY ========== */}
      {data.accuracyChecks.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.h1}>LLM Accuracy Verification</Text>

          <Text style={styles.paragraph}>
            We tested each AI platform's accuracy when discussing your brand to identify hallucinations,
            missing information, and factual errors. This helps you understand what AI systems are
            actually telling users about you.
          </Text>

          {data.accuracyChecks.map((check, idx) => (
            <View key={idx} style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.h3}>{check.platform}</Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: check.overall_accuracy >= 90 ? '#000000' : '#666666' }}>
                  {check.overall_accuracy}%
                </Text>
              </View>

              <View style={styles.calloutBox}>
                <Text style={styles.calloutTitle}>Accuracy Breakdown</Text>
                {check.correct_facts.length > 0 && (
                  <>
                    <Text style={{ ...styles.calloutText, fontWeight: 'bold', marginTop: 6 }}>✓ Correct Facts:</Text>
                    {check.correct_facts.slice(0, 3).map((fact, fIdx) => (
                      <Text key={fIdx} style={{ ...styles.calloutText, fontSize: 9, marginLeft: 10 }}>
                        • {fact}
                      </Text>
                    ))}
                  </>
                )}

                {check.hallucinations.length > 0 && (
                  <>
                    <Text style={{ ...styles.calloutText, fontWeight: 'bold', marginTop: 8, color: '#DC2626' }}>
                      ⚠ Hallucinations Detected: {check.hallucinations.length}
                    </Text>
                    {check.hallucinations.slice(0, 2).map((h, hIdx) => (
                      <Text key={hIdx} style={{ ...styles.calloutText, fontSize: 9, marginLeft: 10, color: '#666666' }}>
                        • "{h.claim}" - {h.reason} ({h.severity})
                      </Text>
                    ))}
                  </>
                )}

                {check.missing_info.length > 0 && (
                  <>
                    <Text style={{ ...styles.calloutText, fontWeight: 'bold', marginTop: 8 }}>
                      Missing Information:
                    </Text>
                    {check.missing_info.slice(0, 3).map((info, iIdx) => (
                      <Text key={iIdx} style={{ ...styles.calloutText, fontSize: 9, marginLeft: 10 }}>
                        • {info}
                      </Text>
                    ))}
                  </>
                )}
              </View>
            </View>
          ))}

        </Page>
      )}

      {/* ========== APPENDIX ========== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Appendix: Technical Details</Text>

        <Text style={styles.h2}>Scoring Methodology</Text>
        <Text style={styles.paragraph}>
          Each dimension (AIC, CES, MTS) is calculated as the average of 5 sub-scores, each rated 0-10.
          The final GEO score applies the weighted formula: (AIC × 0.40) + (CES × 0.35) + (MTS × 0.25).
        </Text>

        <Text style={styles.h2}>Data Sources</Text>
        <Text style={styles.listItem}>• Website crawl and content analysis of {data.domain}</Text>
        <Text style={styles.listItem}>• API testing across ChatGPT, Claude, Gemini, and Perplexity</Text>
        <Text style={styles.listItem}>• Competitive intelligence via Tracxn and public data sources</Text>
        <Text style={styles.listItem}>• Manual verification by AI visibility experts</Text>

        <Text style={styles.h2}>Score Interpretation Guide</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Score Range</Text>
            <Text style={{ ...styles.tableHeaderCell, flex: 2 }}>Interpretation</Text>
            <Text style={{ ...styles.tableHeaderCell, flex: 2 }}>Action Required</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellBold}>8.0 - 10.0</Text>
            <Text style={{ ...styles.tableCell, flex: 2 }}>Excellent - Industry Leader</Text>
            <Text style={{ ...styles.tableCell, flex: 2 }}>Maintain & optimize</Text>
          </View>
          <View style={styles.tableRowAlt}>
            <Text style={styles.tableCellBold}>6.0 - 7.9</Text>
            <Text style={{ ...styles.tableCell, flex: 2 }}>Good - Competitive</Text>
            <Text style={{ ...styles.tableCell, flex: 2 }}>Focus on quick wins</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellBold}>4.0 - 5.9</Text>
            <Text style={{ ...styles.tableCell, flex: 2 }}>Fair - Room for Growth</Text>
            <Text style={{ ...styles.tableCell, flex: 2 }}>Strategic overhaul needed</Text>
          </View>
          <View style={styles.tableRowAlt}>
            <Text style={styles.tableCellBold}>0.0 - 3.9</Text>
            <Text style={{ ...styles.tableCell, flex: 2 }}>Critical - Major Gaps</Text>
            <Text style={{ ...styles.tableCell, flex: 2 }}>Immediate action required</Text>
          </View>
        </View>

        <Text style={styles.h2}>Glossary</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>GEO:</Text> Generative Engine Optimization - optimization for AI platforms{'\n'}
          <Text style={styles.boldText}>AIC:</Text> Answerability & Intent Coverage{'\n'}
          <Text style={styles.boldText}>CES:</Text> Credibility, Evidence & Safety{'\n'}
          <Text style={styles.boldText}>MTS:</Text> Machine-Readability & Technical Signals{'\n'}
          <Text style={styles.boldText}>Hallucination:</Text> AI-generated false or inaccurate information{'\n'}
          <Text style={styles.boldText}>Citation Rate:</Text> Frequency your brand is cited as a source
        </Text>

      </Page>

      {/* ========== CLOSING PAGE ========== */}
      <Page size="A4" style={styles.page}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 36, fontWeight: 'bold', marginBottom: 30 }}>
            Radius
          </Text>
          <Text style={{ fontSize: 16, color: '#666666', textAlign: 'center', marginBottom: 40 }}>
            Enterprise AI Visibility Platform
          </Text>
          
          <View style={{ width: '60%', borderTopWidth: 1, borderTopColor: '#E5E5E5', borderTopStyle: 'solid', marginVertical: 30 }} />
          
          <Text style={{ fontSize: 12, color: '#333333', textAlign: 'center', marginBottom: 20 }}>
            For questions about this report or to schedule a consultation:
          </Text>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
            hello@radius.ai
          </Text>
          <Text style={{ fontSize: 14, fontWeight: 'bold' }}>
            www.radius.ai
          </Text>
          
          <View style={{ marginTop: 60 }}>
            <Text style={{ fontSize: 9, color: '#999999', textAlign: 'center' }}>
              © {new Date().getFullYear()} Radius Analytics. All rights reserved.
            </Text>
            <Text style={{ fontSize: 9, color: '#999999', textAlign: 'center', marginTop: 4 }}>
              This report is confidential and intended solely for the use of {data.domain}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

interface PDFReportProps {
  data: ReportData;
  filename?: string;
}

export function PDFReport({ data, filename }: PDFReportProps) {
  const defaultFilename = `radius-geo-analysis-${data.domain}-${format(data.generatedAt, 'yyyy-MM-dd')}.pdf`;
  
  return (
    <PDFDownloadLink
      document={<RadiusPDFDocument data={data} />}
      fileName={filename || defaultFilename}
    >
      {({ loading }) => (
        <Button
          variant="default"
          disabled={loading}
          data-testid="button-download-pdf"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {loading ? 'Generating Report...' : 'Download PDF Report'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}

import { extractKeywords } from "@/lib/ai/extract-keywords";
import { fetchKeywordMetrics } from "@/lib/dataforseo/keyword-data";
import { fetchTrendData } from "@/lib/dataforseo/trends";
import { fetchSerpCompetitors } from "@/lib/dataforseo/serp";
import { fetchAmazonData } from "@/lib/dataforseo/amazon";
import { analyzeCompetitorsMoat } from "@/lib/ai/analyze-competitors";
import { scoreIdea } from "@/lib/ai/score-idea";
import type { PipelineEvent } from "@/types/pipeline";

export async function runValidationPipeline(
  ideaText: string,
  emit: (event: PipelineEvent) => void
): Promise<void> {
  // Stage 1: Keyword Extraction (Claude)
  emit({
    type: "stage_start",
    stage: "keywords",
    message: "Extracting keywords from your idea...",
  });

  const keywordResult = await extractKeywords(ideaText);
  emit({ type: "stage_complete", stage: "keywords", data: keywordResult });

  const keywordStrings = keywordResult.keywords.map((k) => k.keyword);

  // Stage 2: Search Volume & CPC (DataForSEO)
  emit({
    type: "stage_start",
    stage: "metrics",
    message: "Fetching real search data...",
  });

  const { metrics, source: metricsSource } = await fetchKeywordMetrics(
    keywordStrings,
    keywordResult.location
  );
  emit({
    type: "stage_complete",
    stage: "metrics",
    data: { metrics, source: metricsSource },
  });

  // Stage 3: Trend Analysis (DataForSEO Google Trends)
  emit({
    type: "stage_start",
    stage: "trends",
    message: "Analyzing search trends...",
  });

  const trendData = await fetchTrendData(keywordStrings, keywordResult.location);
  emit({ type: "stage_complete", stage: "trends", data: trendData });

  // Stage 4: Competitor Analysis (DataForSEO SERP + Claude)
  emit({
    type: "stage_start",
    stage: "competitors",
    message: "Analyzing top competitors...",
  });

  const serpData = await fetchSerpCompetitors(
    keywordStrings,
    keywordResult.location
  );
  emit({ type: "stage_progress", stage: "competitors", progress: 50 });

  const moatResult = await analyzeCompetitorsMoat(
    serpData,
    keywordResult.niche,
    keywordResult.location
  );
  emit({
    type: "stage_complete",
    stage: "competitors",
    data: {
      competitors: moatResult.competitors,
      moat: moatResult.moat_analysis,
    },
  });

  // Stage 5: eCommerce Signal (DataForSEO Amazon)
  emit({
    type: "stage_start",
    stage: "ecommerce",
    message: "Checking Amazon marketplace data...",
  });

  const amazonData = await fetchAmazonData(
    keywordStrings,
    keywordResult.location
  );
  emit({ type: "stage_complete", stage: "ecommerce", data: amazonData });

  // Stage 6: Scoring (Claude — enhanced with trend + Amazon data)
  emit({
    type: "stage_start",
    stage: "scoring",
    message: "Computing your validation score...",
  });

  const scores = await scoreIdea(keywordResult, metrics, moatResult, trendData, amazonData);
  emit({ type: "stage_complete", stage: "scoring", data: scores });

  // Done
  emit({
    type: "pipeline_complete",
    summary: {
      idea: ideaText,
      niche: keywordResult.niche,
      location: keywordResult.location,
      overall_score: scores.overall_score,
      verdict: scores.verdict,
    },
  });
}

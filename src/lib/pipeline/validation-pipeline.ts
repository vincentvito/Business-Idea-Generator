import { extractKeywords } from "@/lib/ai/extract-keywords";
import { fetchKeywordMetrics } from "@/lib/dataforseo/keyword-data";
import { fetchTrendData } from "@/lib/dataforseo/trends";
import { fetchSerpCompetitors } from "@/lib/dataforseo/serp";
import { fetchAmazonData } from "@/lib/dataforseo/amazon";
import { fetchLocalCompetitors } from "@/lib/dataforseo/google-maps";
import { fetchBusinessDetails } from "@/lib/dataforseo/google-business";
import { analyzeCompetitorsMoat } from "@/lib/ai/analyze-competitors";
import { scoreIdea } from "@/lib/ai/score-idea";
import type { PipelineEvent } from "@/types/pipeline";
import type { LocalCompetitionData } from "@/types/validation";

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
    ...(metricsSource === "mock" ? { warning: "Using estimated data — live API returned an error" } : {}),
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

  // Stage 5: Local Competition (Google Maps + Business Info)
  emit({
    type: "stage_start",
    stage: "local_competition",
    message: "Scanning local competitors on Google Maps...",
  });

  let localCompetition: LocalCompetitionData | null = null;

  if (keywordResult.location && keywordResult.location.toLowerCase() !== "global") {
    localCompetition = await fetchLocalCompetitors(
      keywordResult.niche,
      keywordResult.location
    );

    // Fetch detailed info for top 3 by review count (cost-controlled)
    if (localCompetition.top_competitors.length > 0) {
      const topNames = localCompetition.top_competitors
        .sort((a, b) => b.reviews_count - a.reviews_count)
        .slice(0, 3)
        .map((c) => c.name);

      localCompetition.detailed_competitors = await fetchBusinessDetails(
        topNames,
        keywordResult.location
      );
    }
  }

  emit({
    type: "stage_complete",
    stage: "local_competition",
    data: localCompetition,
    ...((!keywordResult.location || keywordResult.location.toLowerCase() === "global")
      ? { warning: "No location specified — local competition analysis skipped" }
      : {}),
  });

  // Stage 6: eCommerce Signal (DataForSEO Amazon)
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

  // Stage 7: Scoring (Claude — enhanced with trend + Amazon + local competition data)
  emit({
    type: "stage_start",
    stage: "scoring",
    message: "Computing your validation score...",
  });

  const scores = await scoreIdea(keywordResult, metrics, moatResult, trendData, amazonData, localCompetition);
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

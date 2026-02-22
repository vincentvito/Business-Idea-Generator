import { getAnthropicClient } from "./client";
import { SYSTEM_PROMPTS, MODEL } from "./prompts";
import type {
  KeywordExtractionResult,
  KeywordMetrics,
  CompetitorMoatResult,
  TrendData,
  AmazonProductData,
  LocalCompetitionData,
  ScoreData,
} from "@/types/validation";

const SCORE_TOOL = {
  name: "score_idea" as const,
  description:
    "Computes a quantitative validation score for a food business idea based on search data, trends, competitors, and marketplace signals.",
  input_schema: {
    type: "object" as const,
    properties: {
      overall_score: {
        type: "number",
        description: "Overall validation score 0-100",
      },
      market_demand_score: {
        type: "number",
        description: "Market demand score 0-100, based on search volume",
      },
      competition_score: {
        type: "number",
        description:
          "Competition score 0-100, higher means easier to compete",
      },
      monetization_score: {
        type: "number",
        description:
          "Monetization score 0-100, based on CPC and Amazon pricing as willingness-to-pay proxies",
      },
      timing_score: {
        type: "number",
        description: "Timing score 0-100, based on Google Trends data (rising=70-100, stable=40-70, declining=0-40)",
      },
      ecommerce_score: {
        type: "number",
        description: "eCommerce viability score 0-100, based on Amazon marketplace data (product count, pricing, ratings, reviews)",
      },
      local_competition_score: {
        type: "number",
        description: "Local competition score 0-100, based on Google Maps competitor density, ratings, and market gaps. Omit if no local data available.",
      },
      verdict: {
        type: "string",
        enum: ["strong", "promising", "risky", "weak"],
      },
      one_liner: {
        type: "string",
        description:
          "One-line summary, e.g. 'High demand, rising trend, moderate competition — strong opportunity'",
      },
      key_risks: {
        type: "array",
        items: { type: "string" },
        description: "Top 3-5 risks for this idea",
      },
      next_steps: {
        type: "array",
        items: { type: "string" },
        description: "Top 3-5 recommended next steps",
      },
    },
    required: [
      "overall_score",
      "market_demand_score",
      "competition_score",
      "monetization_score",
      "timing_score",
      "ecommerce_score",
      "verdict",
      "one_liner",
      "key_risks",
      "next_steps",
    ],
  },
};

export async function scoreIdea(
  keywords: KeywordExtractionResult,
  metrics: KeywordMetrics[],
  moatResult: CompetitorMoatResult,
  trendData?: TrendData[],
  amazonData?: AmazonProductData[],
  localCompetition?: LocalCompetitionData | null
): Promise<ScoreData> {
  const client = getAnthropicClient();

  const metricsTable = metrics
    .map(
      (m) =>
        `- "${m.keyword}": ${m.avg_monthly_searches} searches/mo, CPC $${m.high_top_of_page_bid.toFixed(2)}, competition: ${m.competition} (${m.competition_index}/100)`
    )
    .join("\n");

  const competitorSummary = moatResult.competitors
    .map(
      (c) =>
        `- ${c.name}: Authority=${c.estimated_authority}, Weaknesses: ${c.weaknesses.join(", ")}`
    )
    .join("\n");

  // Build trend summary
  const trendSummary = trendData && trendData.length > 0
    ? trendData
        .map(
          (t) =>
            `- "${t.keyword}": ${t.trend_direction} (${t.growth_percentage > 0 ? "+" : ""}${t.growth_percentage}% YoY)`
        )
        .join("\n")
    : "No trend data available.";

  // Build Amazon summary
  let amazonSummary = "No Amazon marketplace data available.";
  if (amazonData && amazonData.length > 0) {
    const totalProducts = amazonData.reduce((s, a) => s + a.total_products, 0);
    const avgPrice =
      amazonData.reduce((s, a) => s + a.avg_price, 0) / amazonData.length;
    const avgRating =
      amazonData.reduce((s, a) => s + a.avg_rating, 0) / amazonData.length;
    const topProduct = amazonData[0]?.top_products[0];

    amazonSummary = `Amazon Marketplace:
- Total products found: ${totalProducts}
- Average product price: $${avgPrice.toFixed(2)}
- Average product rating: ${avgRating.toFixed(1)}/5
${topProduct ? `- Top product: "${topProduct.title}" — $${topProduct.price.toFixed(2)}, ${topProduct.reviews_count} reviews, ${topProduct.rating.toFixed(1)}/5 rating` : ""}`;
  }

  // Build local competition summary
  let localCompSummary = "No local competitor data available (no location specified or data unavailable).";
  if (localCompetition) {
    localCompSummary = `Local Competition (Google Maps):
- Total local competitors found: ${localCompetition.total_competitors}
- Average rating: ${localCompetition.avg_rating}/5 (${localCompetition.avg_reviews} avg reviews)
- Saturation level: ${localCompetition.saturation_level}
- Rating breakdown: ${localCompetition.rating_distribution.excellent} excellent, ${localCompetition.rating_distribution.good} good, ${localCompetition.rating_distribution.average} average, ${localCompetition.rating_distribution.poor} poor
- Top competitors: ${localCompetition.top_competitors
      .slice(0, 5)
      .map(
        (c) =>
          `"${c.name}" (${c.rating}/5, ${c.reviews_count} reviews, ${c.price_level ?? "N/A"})`
      )
      .join(", ")}`;

    if (localCompetition.detailed_competitors.length > 0) {
      localCompSummary += "\n- Detailed competitor profiles:";
      for (const d of localCompetition.detailed_competitors) {
        localCompSummary += `\n  * "${d.name}": ${d.rating}/5 (${d.reviews_count} reviews), Category: ${d.category}, Photos: ${d.total_photos}, Claimed: ${d.is_claimed}`;
        if (d.rating_distribution) {
          localCompSummary += `, Stars: ${JSON.stringify(d.rating_distribution)}`;
        }
      }
    }
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPTS.IDEA_SCORER,
    tool_choice: { type: "tool", name: "score_idea" },
    tools: [SCORE_TOOL],
    messages: [
      {
        role: "user",
        content: `Score this food business idea based on the data below.

Food Business Niche: ${keywords.niche}
Location: ${keywords.location}
Category: ${keywords.category}

Keyword Metrics:
${metricsTable}

Search Trends (Google Trends):
${trendSummary}

Competitive Landscape:
Overall competition: ${moatResult.moat_analysis.overall_competition_level}
Biggest gap: ${moatResult.moat_analysis.biggest_gap}
${competitorSummary}

${localCompSummary}

${amazonSummary}

Provide scores from 0-100 for each dimension. Be data-driven — high search volume with low competition should score well. Low volume or extremely high competition should score poorly. Use trend data for the timing_score. Use Amazon data for the ecommerce_score. Use local Google Maps data for the local_competition_score (omit if no local data). Consider CPC and Amazon pricing as proxies for commercial viability.`,
      },
    ],
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return structured score data");
  }
  return toolUse.input as ScoreData;
}

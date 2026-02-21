import { getAnthropicClient } from "./client";
import { SYSTEM_PROMPTS, MODEL } from "./prompts";
import type { CompetitorData, CompetitorMoatResult } from "@/types/validation";

const ANALYZE_TOOL = {
  name: "analyze_competitors" as const,
  description:
    "Analyzes competitor data from search results and identifies strengths, weaknesses, and market gaps.",
  input_schema: {
    type: "object" as const,
    properties: {
      competitors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            url: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            estimated_authority: {
              type: "string",
              enum: ["low", "medium", "high"],
            },
            differentiation_opportunity: { type: "string" },
          },
          required: [
            "name",
            "url",
            "strengths",
            "weaknesses",
            "estimated_authority",
            "differentiation_opportunity",
          ],
        },
      },
      moat_analysis: {
        type: "object",
        properties: {
          overall_competition_level: {
            type: "string",
            enum: ["low", "medium", "high", "very_high"],
          },
          biggest_gap: { type: "string" },
          recommended_positioning: { type: "string" },
          unfair_advantages_to_build: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: [
          "overall_competition_level",
          "biggest_gap",
          "recommended_positioning",
          "unfair_advantages_to_build",
        ],
      },
    },
    required: ["competitors", "moat_analysis"],
  },
};

export async function analyzeCompetitorsMoat(
  serpData: CompetitorData[],
  niche: string,
  location: string
): Promise<CompetitorMoatResult> {
  const client = getAnthropicClient();

  const competitorSummary = serpData
    .map(
      (c, i) =>
        `${i + 1}. "${c.title}" - ${c.url}\n   Domain: ${c.domain}\n   Snippet: ${c.snippet}\n   Has sitelinks: ${c.sitelinks > 0}\n   Has rich snippets: ${c.rich_snippet}`
    )
    .join("\n\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPTS.COMPETITOR_ANALYST,
    tool_choice: { type: "tool", name: "analyze_competitors" },
    tools: [ANALYZE_TOOL],
    messages: [
      {
        role: "user",
        content: `Analyze these top search results for the "${niche}" niche in ${location}. Identify each competitor's strengths and weaknesses, and provide a moat analysis with actionable differentiation opportunities.

Search Results:
${competitorSummary}

For each competitor, assess:
- Their strengths (brand presence, content quality, features visible from snippet)
- Their weaknesses (poor UX signals, missing features, outdated content, gaps)
- Their estimated domain authority (based on sitelinks, rich snippets, domain name)
- A specific differentiation opportunity against them

Then provide an overall moat analysis: competition level, the biggest market gap, recommended positioning, and unfair advantages a newcomer should build.`,
      },
    ],
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return structured competitor analysis");
  }
  return toolUse.input as CompetitorMoatResult;
}

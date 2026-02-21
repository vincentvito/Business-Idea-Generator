import { getAnthropicClient } from "./client";
import { SYSTEM_PROMPTS, MODEL } from "./prompts";
import type { KeywordExtractionResult } from "@/types/validation";

const EXTRACTION_TOOL = {
  name: "extract_keywords" as const,
  description:
    "Extracts the most valuable search keywords from a business idea description.",
  input_schema: {
    type: "object" as const,
    properties: {
      keywords: {
        type: "array",
        items: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description: "The search keyword or phrase",
            },
            intent: {
              type: "string",
              enum: [
                "informational",
                "commercial",
                "transactional",
                "navigational",
              ],
              description: "Search intent category",
            },
            relevance: {
              type: "number",
              description: "Relevance score 0-100 to the original business idea",
            },
          },
          required: ["keyword", "intent", "relevance"],
        },
        description: "8-15 keywords ordered by expected commercial value",
      },
      niche: { type: "string", description: "The identified business niche" },
      location: {
        type: "string",
        description:
          "The identified target location, or 'global' if none specified",
      },
      category: {
        type: "string",
        description:
          "Business category (e.g., Food & Beverage, SaaS, Fitness)",
      },
    },
    required: ["keywords", "niche", "location", "category"],
  },
};

export async function extractKeywords(
  ideaText: string
): Promise<KeywordExtractionResult> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPTS.KEYWORD_EXTRACTOR,
    tool_choice: { type: "tool", name: "extract_keywords" },
    tools: [EXTRACTION_TOOL],
    messages: [
      {
        role: "user",
        content: `Analyze this business idea and extract the most commercially valuable search keywords that potential customers would use. Consider both the product/service AND the location. Include long-tail keywords, competitor brand-adjacent terms, and problem-aware queries.

Business idea: "${ideaText}"

Extract 8-15 keywords ordered by expected commercial value (highest first). For each keyword, classify the search intent and rate relevance to the core business idea.`,
      },
    ],
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return structured keyword data");
  }
  return toolUse.input as KeywordExtractionResult;
}

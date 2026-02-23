import { getAnthropicClient } from "./client";
import { SYSTEM_PROMPTS, MODEL } from "./prompts";
import type { IdeaStub, DiscoveryFilters } from "@/types/discovery";
import type { SeedKeyword } from "@/lib/dataforseo/keyword-suggestions";

const GENERATE_IDEAS_TOOL = {
  name: "generate_ideas" as const,
  description: "Generates 10 localized food business ideas for a category and location.",
  input_schema: {
    type: "object" as const,
    properties: {
      ideas: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "number" },
            title: { type: "string", description: "Short business name/concept" },
            one_liner: {
              type: "string",
              description: "One-sentence description",
            },
            pain_point: {
              type: "string",
              description: "The specific local pain point this addresses",
            },
            target_audience: {
              type: "string",
              description: "Primary target audience",
            },
            suggested_keywords: {
              type: "array",
              items: { type: "string" },
              description:
                "3-4 Google Ads search keywords that REAL people already type. RULES: (1) At least 2 MUST come directly from the seed keyword list, or be minor variations (add the city name, add 'near me'). (2) At most 1 can be a related category keyword not in the seed list. (3) NEVER use the idea title, product name, or brand name as a keyword — only generic search terms people type BEFORE they know the business exists. (4) Keep keywords to 2-3 words; avoid 5+ word phrases which have no measurable search volume. (5) Some keyword overlap between ideas is fine — real keywords with volume are better than unique but invented ones. GOOD examples: 'energy bars Dubai', 'meal prep delivery', 'keto meal plan'. BAD examples: 'desert heat energy bites', 'halal keto meal kits', 'emirati spice subscription box'.",
            },
          },
          required: [
            "id",
            "title",
            "one_liner",
            "pain_point",
            "target_audience",
            "suggested_keywords",
          ],
        },
      },
    },
    required: ["ideas"],
  },
};

function buildFilterConstraints(filters?: DiscoveryFilters): string {
  if (!filters) return "";

  const lines: string[] = [];
  if (filters.budget) lines.push(`- Investment budget: ${filters.budget} — only suggest ideas feasible within this budget range`);
  if (filters.businessModel) lines.push(`- Business model: ${filters.businessModel} — all ideas must follow this model type`);
  if (filters.founderSkills) lines.push(`- Founder skills/background: ${filters.founderSkills} — ideas must be buildable with these skills`);
  if (filters.timeCommitment) lines.push(`- Time commitment: ${filters.timeCommitment}`);
  if (filters.revenueGoal) lines.push(`- Revenue target: ${filters.revenueGoal}`);
  if (filters.targetMarket) lines.push(`- Target market: ${filters.targetMarket}`);
  if (filters.teamSize) lines.push(`- Team size: ${filters.teamSize}`);
  if (filters.deliveryModel) lines.push(`- Delivery model: ${filters.deliveryModel}`);
  if (filters.timeToRevenue) lines.push(`- Expected time to first revenue: ${filters.timeToRevenue}`);
  if (filters.cuisineSpecialty && filters.cuisineSpecialty !== "No Specific Cuisine")
    lines.push(`- Cuisine/specialty focus: ${filters.cuisineSpecialty} — ideas should be relevant to or inspired by this cuisine/specialty`);

  if (lines.length === 0) return "";
  return `\n\nFounder constraints (all ideas MUST respect these):\n${lines.join("\n")}`;
}

function buildSeedKeywordsContext(seedKeywords?: SeedKeyword[]): string {
  if (!seedKeywords || seedKeywords.length === 0) return "";

  const highVolume = seedKeywords.filter((k) => k.search_volume > 10000);
  const niche = seedKeywords.filter((k) => k.search_volume >= 500 && k.search_volume <= 10000);

  const formatKw = (k: SeedKeyword) =>
    `- "${k.keyword}" (${k.search_volume.toLocaleString()}/mo, CPC $${k.cpc.toFixed(2)})`;

  let context = "\n\nReal search data for this space:";

  if (highVolume.length > 0) {
    context += `\n\nHIGH-VOLUME KEYWORDS (broad market signals):\n${highVolume.map(formatKw).join("\n")}`;
  }
  if (niche.length > 0) {
    context += `\n\nNICHE KEYWORDS (specific opportunities — often less competition):\n${niche.map(formatKw).join("\n")}`;
  }

  context += `\n\nIMPORTANT KEYWORD RULES:
- Each idea MUST have 3-4 keywords. At least 2 MUST come directly from the seed keyword list above (copy them exactly, or append the city/location name).
- The remaining 1-2 keywords should be real Google search phrases that are CLOSE VARIATIONS of seed keywords (e.g., adding "near me", the location name, or swapping one word). Do NOT invent new compound phrases.
- NEVER use the business name, product name, or brand name as a keyword. Keywords must be generic search terms people type BEFORE they know your business exists.
- Some keyword overlap between ideas is OK — it is far better to reuse a real keyword than to invent a fake one that returns zero search volume.
- Keep keywords to 2-3 words. Avoid phrases longer than 4 words — they rarely have measurable search volume.
- Mix ideas across both high-volume markets AND niche opportunities.`;

  return context;
}

export async function generateIdeas(
  category: string,
  location: string,
  filters?: DiscoveryFilters,
  seedKeywords?: SeedKeyword[]
): Promise<IdeaStub[]> {
  const client = getAnthropicClient();
  const filterConstraints = buildFilterConstraints(filters);
  const seedContext = buildSeedKeywordsContext(seedKeywords);

  const isGlobal = !location;
  const locationLabel = isGlobal ? "the global market" : location;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: SYSTEM_PROMPTS.IDEA_GENERATOR,
    tool_choice: { type: "tool", name: "generate_ideas" },
    tools: [GENERATE_IDEAS_TOOL],
    messages: [
      {
        role: "user",
        content: `Generate exactly 10 unique, specific food business ideas in the "${category}" category for ${locationLabel}.${filterConstraints}${seedContext}

Requirements:
- Each idea must address a SPECIFIC pain point ${isGlobal ? "in this industry" : `that exists in ${location}`}
- Include ideas across different sub-niches within ${category}
${filters?.businessModel ? "" : "- Vary the business models: services, products, subscriptions, marketplaces, apps\n"}${isGlobal ? "- Consider global market trends, scalability, and online distribution" : "- Consider local culture, demographics, climate, and economy"}
- Mix of ideas: some targeting high-volume markets, some targeting underserved niches
- For each idea, suggest 3-4 Google search keywords following these STRICT rules:
  - At least 2 keywords MUST come directly from the seed keyword list (copy them exactly, or add the location name)
  - The remaining 1-2 should be close variations of seed keywords (swap one word, add "near me", etc.)
  - NEVER use the idea title, product name, or brand name as a keyword — only generic search terms
  - Some overlap between ideas is fine — real keywords with volume are better than unique but fake ones
  - Keep keywords to 2-3 words. Avoid phrases longer than 4 words.
- Number ideas from 1 to 10

Make ideas specific and actionable, not generic. For example:
- BAD: "Online fitness coaching"
- GOOD: "AI-personalized HIIT workout plans for Dubai office workers dealing with heat-limited outdoor exercise"`,
      },
    ],
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return structured ideas");
  }
  return (toolUse.input as { ideas: IdeaStub[] }).ideas;
}

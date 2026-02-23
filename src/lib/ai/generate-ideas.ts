import { getAnthropicClient } from "./client";
import { SYSTEM_PROMPTS, MODEL } from "./prompts";
import type { IdeaStub, DiscoveryFilters } from "@/types/discovery";
import type { SeedKeyword } from "@/lib/dataforseo/keyword-suggestions";

const GENERATE_IDEAS_TOOL = {
  name: "generate_ideas" as const,
  description: "Generates 15 localized food business ideas for a category and location.",
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
                "3-4 Google search keywords unique to THIS idea. RULES: (1) At least 2 must be specific long-tail phrases (3-5 words) that someone searching for THIS exact product/service would type. (2) At most 1 can be a broad keyword from the seed list. (3) NEVER reuse the same keyword across different ideas — every idea must have its own distinct set. Example for a yoga studio idea: 'hot yoga classes NYC', 'beginner yoga studio', 'yoga membership near me'.",
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
- Use these keywords as INSPIRATION for the problems people are searching to solve.
- Each idea MUST have 3-4 keywords that are UNIQUE to that idea. Do NOT reuse the same keyword across multiple ideas.
- At least 2 keywords per idea must be specific long-tail phrases (3-5 words) that a real person would type to find THAT specific product/service.
- At most 1 keyword per idea can be a broad term from the list above.
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

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPTS.IDEA_GENERATOR,
    tool_choice: { type: "tool", name: "generate_ideas" },
    tools: [GENERATE_IDEAS_TOOL],
    messages: [
      {
        role: "user",
        content: `Generate exactly 15 unique, specific food business ideas in the "${category}" category for ${location}.${filterConstraints}${seedContext}

Requirements:
- Each idea must address a SPECIFIC pain point that exists in ${location}
- Include ideas across different sub-niches within ${category}
${filters?.businessModel ? "" : "- Vary the business models: services, products, subscriptions, marketplaces, apps\n"}- Consider local culture, demographics, climate, and economy
- Mix of ideas: some targeting high-volume markets, some targeting underserved niches
- For each idea, suggest 3-4 Google search keywords following these STRICT rules:
  - At least 2 keywords must be SPECIFIC long-tail phrases (3-5 words) unique to THIS idea
  - At most 1 keyword can be a broad term from the seed list
  - NEVER reuse the exact same keyword across different ideas — each idea needs its OWN keywords
  - Keywords must be things real people actually type into Google
- Number ideas from 1 to 15

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

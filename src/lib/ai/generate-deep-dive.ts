import { getAnthropicClient } from "./client";
import { SYSTEM_PROMPTS, MODEL } from "./prompts";
import type { RankedIdea, DiscoveryFilters } from "@/types/discovery";
import type {
  BusinessPlanBasics,
  BrandNameSuggestion,
  DevilsAdvocate,
  ValidationRoadmap,
} from "@/types/deep-dive";

// ── Tool schemas ─────────────────────────────────────────

const BUSINESS_PLAN_TOOL = {
  name: "generate_business_plan" as const,
  description:
    "Generates comprehensive business plan basics and brand name suggestions.",
  input_schema: {
    type: "object" as const,
    properties: {
      business_plan: {
        type: "object",
        properties: {
          executive_summary: {
            type: "object",
            properties: {
              overview: { type: "string" },
              value_proposition: { type: "string" },
              business_model: { type: "string" },
              target_market_summary: { type: "string" },
            },
            required: [
              "overview",
              "value_proposition",
              "business_model",
              "target_market_summary",
            ],
          },
          mission_vision: {
            type: "object",
            properties: {
              mission: { type: "string" },
              vision: { type: "string" },
              core_values: { type: "array", items: { type: "string" } },
            },
            required: ["mission", "vision", "core_values"],
          },
          target_market: {
            type: "object",
            properties: {
              primary_segment: { type: "string" },
              segment_size: { type: "string" },
              demographics: { type: "array", items: { type: "string" } },
              psychographics: { type: "array", items: { type: "string" } },
              pain_points: { type: "array", items: { type: "string" } },
              buying_behavior: { type: "string" },
            },
            required: [
              "primary_segment",
              "segment_size",
              "demographics",
              "psychographics",
              "pain_points",
              "buying_behavior",
            ],
          },
          competitive_advantage: {
            type: "object",
            properties: {
              direct_competitors: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    weakness: { type: "string" },
                  },
                  required: ["name", "weakness"],
                },
              },
              indirect_competitors: {
                type: "array",
                items: { type: "string" },
              },
              your_differentiators: {
                type: "array",
                items: { type: "string" },
              },
              moat_strategy: { type: "string" },
            },
            required: [
              "direct_competitors",
              "indirect_competitors",
              "your_differentiators",
              "moat_strategy",
            ],
          },
          financial_projections: {
            type: "object",
            properties: {
              startup_costs: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    item: { type: "string" },
                    amount: { type: "string" },
                  },
                  required: ["item", "amount"],
                },
              },
              monthly_operating_costs: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    item: { type: "string" },
                    amount: { type: "string" },
                  },
                  required: ["item", "amount"],
                },
              },
              revenue_projections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    month: { type: "number" },
                    revenue: { type: "string" },
                    notes: { type: "string" },
                  },
                  required: ["month", "revenue", "notes"],
                },
              },
              break_even_timeline: { type: "string" },
              funding_needed: { type: "string" },
            },
            required: [
              "startup_costs",
              "monthly_operating_costs",
              "revenue_projections",
              "break_even_timeline",
              "funding_needed",
            ],
          },
        },
        required: [
          "executive_summary",
          "mission_vision",
          "target_market",
          "competitive_advantage",
          "financial_projections",
        ],
      },
      brand_names: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            tagline: { type: "string" },
            reasoning: { type: "string" },
            domain_suggestion: { type: "string" },
            style: {
              type: "string",
              enum: ["playful", "professional", "modern", "classic", "techy"],
            },
          },
          required: ["name", "tagline", "reasoning", "domain_suggestion", "style"],
        },
      },
    },
    required: ["business_plan", "brand_names"],
  },
};

const DEVILS_ADVOCATE_TOOL = {
  name: "generate_devils_advocate" as const,
  description:
    "Generates a brutally honest risk assessment with critical risks, failure modes, and challenges.",
  input_schema: {
    type: "object" as const,
    properties: {
      critical_risks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            risk: { type: "string" },
            severity: { type: "string", enum: ["high", "medium", "low"] },
            likelihood: { type: "string", enum: ["high", "medium", "low"] },
            mitigation: { type: "string" },
          },
          required: ["risk", "severity", "likelihood", "mitigation"],
        },
      },
      failure_modes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            scenario: { type: "string" },
            trigger: { type: "string" },
            prevention: { type: "string" },
          },
          required: ["scenario", "trigger", "prevention"],
        },
      },
      market_challenges: { type: "array", items: { type: "string" } },
      execution_challenges: { type: "array", items: { type: "string" } },
      financial_challenges: { type: "array", items: { type: "string" } },
      honest_assessment: { type: "string" },
    },
    required: [
      "critical_risks",
      "failure_modes",
      "market_challenges",
      "execution_challenges",
      "financial_challenges",
      "honest_assessment",
    ],
  },
};

const VALIDATION_ROADMAP_TOOL = {
  name: "generate_validation_roadmap" as const,
  description:
    "Generates a step-by-step validation roadmap with phases, specific action items, and success criteria.",
  input_schema: {
    type: "object" as const,
    properties: {
      phases: {
        type: "array",
        items: {
          type: "object",
          properties: {
            phase: { type: "number" },
            name: { type: "string" },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  week: { type: "number" },
                  title: { type: "string" },
                  description: { type: "string" },
                  action_items: { type: "array", items: { type: "string" } },
                  success_criteria: { type: "string" },
                  estimated_hours: { type: "number" },
                  category: {
                    type: "string",
                    enum: ["research", "build", "launch", "measure"],
                  },
                },
                required: [
                  "id",
                  "week",
                  "title",
                  "description",
                  "action_items",
                  "success_criteria",
                  "estimated_hours",
                  "category",
                ],
              },
            },
          },
          required: ["phase", "name", "steps"],
        },
      },
      total_estimated_weeks: { type: "number" },
      total_estimated_budget: { type: "string" },
    },
    required: ["phases", "total_estimated_weeks", "total_estimated_budget"],
  },
};

// ── Helpers ──────────────────────────────────────────────

function buildIdeaContext(
  idea: RankedIdea,
  category: string,
  location: string,
  filters?: DiscoveryFilters
): string {
  const lines = [
    `Business Idea: ${idea.title}`,
    `Description: ${idea.one_liner}`,
    `Pain Point: ${idea.pain_point}`,
    `Target Audience: ${idea.target_audience}`,
    `Category: ${category}`,
    `Location: ${location}`,
    `Market Data: Search volume ${idea.totalVolume}/mo, Competition: ${idea.avgCompetition}/100, CPC: $${idea.avgCPC.toFixed(2)}`,
    `Keywords: ${idea.suggested_keywords.join(", ")}`,
  ];

  if (filters) {
    if (filters.budget) lines.push(`Budget: ${filters.budget}`);
    if (filters.founderSkills) lines.push(`Skills: ${filters.founderSkills}`);
    if (filters.teamSize) lines.push(`Team: ${filters.teamSize}`);
    if (filters.timeCommitment)
      lines.push(`Time commitment: ${filters.timeCommitment}`);
    if (filters.revenueGoal) lines.push(`Revenue goal: ${filters.revenueGoal}`);
    if (filters.deliveryModel)
      lines.push(`Delivery model: ${filters.deliveryModel}`);
    if (filters.timeToRevenue)
      lines.push(`Time to revenue: ${filters.timeToRevenue}`);
  }

  return lines.join("\n");
}

// ── Individual generation calls ─────────────────────────

async function generateBusinessPlanAndNames(
  idea: RankedIdea,
  category: string,
  location: string,
  filters?: DiscoveryFilters
): Promise<{ businessPlan: BusinessPlanBasics; brandNames: BrandNameSuggestion[] }> {
  const client = getAnthropicClient();
  const context = buildIdeaContext(idea, category, location, filters);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: SYSTEM_PROMPTS.DEEP_DIVE_PLAN,
    tool_choice: { type: "tool", name: "generate_business_plan" },
    tools: [BUSINESS_PLAN_TOOL],
    messages: [
      {
        role: "user",
        content: `Create a comprehensive business plan and suggest 5-8 creative brand names for:\n\n${context}\n\nBe specific to ${location} — use local currency, local platforms, local pricing, and cultural context. Financial projections should cover months 1-12.`,
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return structured business plan data");
  }
  const result = toolUse.input as {
    business_plan: BusinessPlanBasics;
    brand_names: BrandNameSuggestion[];
  };
  return { businessPlan: result.business_plan, brandNames: result.brand_names };
}

async function generateDevilsAdvocate(
  idea: RankedIdea,
  category: string,
  location: string,
  filters?: DiscoveryFilters
): Promise<DevilsAdvocate> {
  const client = getAnthropicClient();
  const context = buildIdeaContext(idea, category, location, filters);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPTS.DEEP_DIVE_CRITIC,
    tool_choice: { type: "tool", name: "generate_devils_advocate" },
    tools: [DEVILS_ADVOCATE_TOOL],
    messages: [
      {
        role: "user",
        content: `Tear apart this food business idea. Find every risk, failure mode, and challenge. Be brutally honest.\n\n${context}\n\nProvide at least 5 critical risks with severity/likelihood ratings, 3+ failure modes, and separate market/execution/financial challenges. End with a no-BS honest assessment paragraph.`,
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return structured devil's advocate data");
  }
  return toolUse.input as DevilsAdvocate;
}

async function generateValidationRoadmap(
  idea: RankedIdea,
  category: string,
  location: string,
  filters?: DiscoveryFilters
): Promise<ValidationRoadmap> {
  const client = getAnthropicClient();
  const context = buildIdeaContext(idea, category, location, filters);
  const teamNote = filters?.teamSize
    ? `Every step must be achievable by a ${filters.teamSize.toLowerCase()}.`
    : "Every step must be achievable by a solo founder.";

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPTS.DEEP_DIVE_ROADMAP,
    tool_choice: { type: "tool", name: "generate_validation_roadmap" },
    tools: [VALIDATION_ROADMAP_TOOL],
    messages: [
      {
        role: "user",
        content: `Create a detailed validation roadmap for:\n\n${context}\n\nBreak it into 4 phases (Customer Discovery, MVP Build, Soft Launch, Measure & Iterate) spanning ~12 weeks. Each step must include hyper-specific action items referencing real places, platforms, and tools in ${location}. For example: "Talk to 5 restaurant owners in [specific neighborhood] about their inventory pain points." ${teamNote}`,
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return structured roadmap data");
  }
  return toolUse.input as ValidationRoadmap;
}

// ── Main orchestrator ───────────────────────────────────

export async function generateDeepDiveContent(
  idea: RankedIdea,
  category: string,
  location: string,
  filters?: DiscoveryFilters
): Promise<{
  businessPlan: BusinessPlanBasics;
  brandNames: BrandNameSuggestion[];
  devilsAdvocate: DevilsAdvocate;
  validationRoadmap: ValidationRoadmap;
}> {
  const [planAndNames, devils, roadmap] = await Promise.all([
    generateBusinessPlanAndNames(idea, category, location, filters),
    generateDevilsAdvocate(idea, category, location, filters),
    generateValidationRoadmap(idea, category, location, filters),
  ]);

  return {
    businessPlan: planAndNames.businessPlan,
    brandNames: planAndNames.brandNames,
    devilsAdvocate: devils,
    validationRoadmap: roadmap,
  };
}

import { getAnthropicClient } from "./client";
import { SYSTEM_PROMPTS, MODEL } from "./prompts";
import { isMenuCategory } from "@/lib/constants";
import type { RankedIdea, DiscoveryFilters } from "@/types/discovery";
import type {
  BusinessPlanBasics,
  BrandNameSuggestion,
  DevilsAdvocate,
  ValidationRoadmap,
  MenuEngineering,
  ProductLineup,
  MenuOrProductData,
  MarketingPlan,
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

const MENU_ENGINEERING_TOOL = {
  name: "generate_menu_engineering" as const,
  description:
    "Generates a complete menu design with pricing, food costs, and BCG matrix classification.",
  input_schema: {
    type: "object" as const,
    properties: {
      menu_categories: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "string" },
                  food_cost_percent: { type: "number" },
                  profit_margin_percent: { type: "number" },
                  category: { type: "string" },
                  classification: {
                    type: "string",
                    enum: ["star", "plowhorse", "puzzle", "dog"],
                  },
                },
                required: [
                  "name",
                  "description",
                  "price",
                  "food_cost_percent",
                  "profit_margin_percent",
                  "category",
                  "classification",
                ],
              },
            },
          },
          required: ["name", "items"],
        },
      },
      pricing_strategy: { type: "string" },
      upsell_recommendations: { type: "array", items: { type: "string" } },
      combo_strategies: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            items: { type: "array", items: { type: "string" } },
            bundle_price: { type: "string" },
            savings_percent: { type: "number" },
          },
          required: ["name", "items", "bundle_price", "savings_percent"],
        },
      },
      food_cost_summary: {
        type: "object",
        properties: {
          average_food_cost_percent: { type: "number" },
          target_food_cost_percent: { type: "number" },
          recommendations: { type: "array", items: { type: "string" } },
        },
        required: [
          "average_food_cost_percent",
          "target_food_cost_percent",
          "recommendations",
        ],
      },
      stars_summary: { type: "string" },
      plowhorses_summary: { type: "string" },
      puzzles_summary: { type: "string" },
      dogs_summary: { type: "string" },
    },
    required: [
      "menu_categories",
      "pricing_strategy",
      "upsell_recommendations",
      "combo_strategies",
      "food_cost_summary",
      "stars_summary",
      "plowhorses_summary",
      "puzzles_summary",
      "dogs_summary",
    ],
  },
};

const PRODUCT_LINEUP_TOOL = {
  name: "generate_product_lineup" as const,
  description:
    "Generates a product portfolio with pricing, margins, and distribution strategy.",
  input_schema: {
    type: "object" as const,
    properties: {
      products: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "string" },
            cost_to_produce: { type: "string" },
            margin_percent: { type: "number" },
            category: { type: "string" },
            classification: {
              type: "string",
              enum: ["hero", "cash_cow", "growth", "niche"],
            },
          },
          required: [
            "name",
            "description",
            "price",
            "cost_to_produce",
            "margin_percent",
            "category",
            "classification",
          ],
        },
      },
      pricing_strategy: { type: "string" },
      bundle_strategies: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            products: { type: "array", items: { type: "string" } },
            bundle_price: { type: "string" },
            value_proposition: { type: "string" },
          },
          required: ["name", "products", "bundle_price", "value_proposition"],
        },
      },
      margin_summary: {
        type: "object",
        properties: {
          average_margin_percent: { type: "number" },
          target_margin_percent: { type: "number" },
          recommendations: { type: "array", items: { type: "string" } },
        },
        required: [
          "average_margin_percent",
          "target_margin_percent",
          "recommendations",
        ],
      },
      distribution_channels: { type: "array", items: { type: "string" } },
      product_roadmap: { type: "string" },
    },
    required: [
      "products",
      "pricing_strategy",
      "bundle_strategies",
      "margin_summary",
      "distribution_channels",
      "product_roadmap",
    ],
  },
};

const MARKETING_PLAN_TOOL = {
  name: "generate_marketing_plan" as const,
  description:
    "Generates a 90-day launch marketing plan with channel strategy, content calendar, and KPIs.",
  input_schema: {
    type: "object" as const,
    properties: {
      overview: { type: "string" },
      total_budget: { type: "string" },
      channels: {
        type: "array",
        items: {
          type: "object",
          properties: {
            channel: { type: "string" },
            strategy: { type: "string" },
            budget_allocation_percent: { type: "number" },
            expected_roi: { type: "string" },
            priority: {
              type: "string",
              enum: ["high", "medium", "low"],
            },
          },
          required: [
            "channel",
            "strategy",
            "budget_allocation_percent",
            "expected_roi",
            "priority",
          ],
        },
      },
      content_calendar: {
        type: "array",
        items: {
          type: "object",
          properties: {
            week: { type: "number" },
            theme: { type: "string" },
            posts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string" },
                  content_type: { type: "string" },
                  topic: { type: "string" },
                  caption_idea: { type: "string" },
                },
                required: ["platform", "content_type", "topic", "caption_idea"],
              },
            },
          },
          required: ["week", "theme", "posts"],
        },
      },
      pre_launch_tactics: { type: "array", items: { type: "string" } },
      launch_week_tactics: { type: "array", items: { type: "string" } },
      ongoing_tactics: { type: "array", items: { type: "string" } },
      kpis: {
        type: "array",
        items: {
          type: "object",
          properties: {
            metric: { type: "string" },
            target: { type: "string" },
            measurement_tool: { type: "string" },
          },
          required: ["metric", "target", "measurement_tool"],
        },
      },
      local_seo_checklist: { type: "array", items: { type: "string" } },
      influencer_strategy: {
        type: "object",
        properties: {
          target_type: { type: "string" },
          outreach_template: { type: "string" },
          budget_per_influencer: { type: "string" },
          expected_reach: { type: "string" },
        },
        required: [
          "target_type",
          "outreach_template",
          "budget_per_influencer",
          "expected_reach",
        ],
      },
    },
    required: [
      "overview",
      "total_budget",
      "channels",
      "content_calendar",
      "pre_launch_tactics",
      "launch_week_tactics",
      "ongoing_tactics",
      "kpis",
      "local_seo_checklist",
      "influencer_strategy",
    ],
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

async function generateMenuOrProduct(
  idea: RankedIdea,
  category: string,
  location: string,
  filters?: DiscoveryFilters
): Promise<MenuOrProductData> {
  const client = getAnthropicClient();
  const context = buildIdeaContext(idea, category, location, filters);

  if (isMenuCategory(category)) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 6144,
      system: SYSTEM_PROMPTS.DEEP_DIVE_MENU,
      tool_choice: { type: "tool", name: "generate_menu_engineering" },
      tools: [MENU_ENGINEERING_TOOL],
      messages: [
        {
          role: "user",
          content: `Design a complete, profitable menu for this ${category} business:\n\n${context}\n\nCreate 15-25 menu items across 4-6 categories. Include appetizers/starters, mains, sides, desserts, and drinks as appropriate for the concept. Classify each item using the Stars/Plowhorses/Puzzles/Dogs matrix. Design at least 3 combo/bundle strategies. All prices in local currency for ${location}. Food costs must be realistic for the cuisine type.`,
        },
      ],
    });
    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Claude did not return structured menu data");
    }
    return { type: "menu", data: toolUse.input as MenuEngineering };
  } else {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 5120,
      system: SYSTEM_PROMPTS.DEEP_DIVE_PRODUCT_LINEUP,
      tool_choice: { type: "tool", name: "generate_product_lineup" },
      tools: [PRODUCT_LINEUP_TOOL],
      messages: [
        {
          role: "user",
          content: `Design a complete product portfolio for this ${category} business:\n\n${context}\n\nCreate 8-15 products including hero products, steady sellers, growth bets, and niche items. Include pricing, production costs, and margin analysis. Design 2-4 bundle strategies. Consider distribution channels relevant to ${location}. Provide a phased product roadmap for the first 12 months.`,
        },
      ],
    });
    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Claude did not return structured product lineup data");
    }
    return { type: "product_lineup", data: toolUse.input as ProductLineup };
  }
}

async function generateMarketingPlan(
  idea: RankedIdea,
  category: string,
  location: string,
  filters?: DiscoveryFilters
): Promise<MarketingPlan> {
  const client = getAnthropicClient();
  const context = buildIdeaContext(idea, category, location, filters);
  const budgetNote = filters?.budget
    ? `The total business budget is ${filters.budget}, so marketing budget should be proportional (typically 3-6% of projected first-year revenue).`
    : "Assume a lean startup marketing budget appropriate for the concept size.";

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 6144,
    system: SYSTEM_PROMPTS.DEEP_DIVE_MARKETING,
    tool_choice: { type: "tool", name: "generate_marketing_plan" },
    tools: [MARKETING_PLAN_TOOL],
    messages: [
      {
        role: "user",
        content: `Create a comprehensive 90-day launch marketing plan for:\n\n${context}\n\n${budgetNote}\n\nInclude:\n- 5-8 marketing channels ranked by priority with specific strategies for each\n- A 12-week content calendar with 3-4 posts per week across platforms, with specific topic ideas and caption drafts\n- Pre-launch, launch week, and ongoing tactics\n- 6-10 measurable KPIs with targets and measurement tools\n- Local SEO checklist specific to ${location}\n- Influencer outreach strategy with template and budget\n\nEvery recommendation must be specific to ${location} — reference local platforms, local food media, local influencers, and local events.`,
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return structured marketing plan data");
  }
  return toolUse.input as MarketingPlan;
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
  menuOrProduct: MenuOrProductData;
  marketingPlan: MarketingPlan;
}> {
  const [planAndNames, devils, roadmap, menuOrProduct, marketing] =
    await Promise.all([
      generateBusinessPlanAndNames(idea, category, location, filters),
      generateDevilsAdvocate(idea, category, location, filters),
      generateValidationRoadmap(idea, category, location, filters),
      generateMenuOrProduct(idea, category, location, filters),
      generateMarketingPlan(idea, category, location, filters),
    ]);

  return {
    businessPlan: planAndNames.businessPlan,
    brandNames: planAndNames.brandNames,
    devilsAdvocate: devils,
    validationRoadmap: roadmap,
    menuOrProduct,
    marketingPlan: marketing,
  };
}

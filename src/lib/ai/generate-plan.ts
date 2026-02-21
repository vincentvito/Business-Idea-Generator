import { getAnthropicClient } from "./client";
import { SYSTEM_PROMPTS, MODEL } from "./prompts";
import type { IdeaStub, DiscoveryFilters } from "@/types/discovery";
import type { DayZeroPlan } from "@/types/discovery";

const PLAN_TOOL = {
  name: "generate_plan" as const,
  description: "Generates a Day Zero business plan with Lean Canvas, revenue model, and 30-day go-to-market strategy.",
  input_schema: {
    type: "object" as const,
    properties: {
      lean_canvas: {
        type: "object",
        properties: {
          problem: { type: "array", items: { type: "string" } },
          solution: { type: "array", items: { type: "string" } },
          unique_value_proposition: { type: "string" },
          unfair_advantage: { type: "string" },
          customer_segments: { type: "array", items: { type: "string" } },
          key_metrics: { type: "array", items: { type: "string" } },
          channels: { type: "array", items: { type: "string" } },
          cost_structure: { type: "array", items: { type: "string" } },
          revenue_streams: { type: "array", items: { type: "string" } },
        },
        required: [
          "problem",
          "solution",
          "unique_value_proposition",
          "unfair_advantage",
          "customer_segments",
          "key_metrics",
          "channels",
          "cost_structure",
          "revenue_streams",
        ],
      },
      revenue_model: {
        type: "object",
        properties: {
          primary_stream: { type: "string" },
          secondary_streams: { type: "array", items: { type: "string" } },
          pricing_strategy: { type: "string" },
          estimated_monthly_revenue_range: { type: "string" },
        },
        required: [
          "primary_stream",
          "secondary_streams",
          "pricing_strategy",
          "estimated_monthly_revenue_range",
        ],
      },
      go_to_market_30_days: {
        type: "array",
        items: {
          type: "object",
          properties: {
            week: { type: "number" },
            tasks: { type: "array", items: { type: "string" } },
            milestone: { type: "string" },
          },
          required: ["week", "tasks", "milestone"],
        },
      },
    },
    required: ["lean_canvas", "revenue_model", "go_to_market_30_days"],
  },
};

function buildFounderContext(filters?: DiscoveryFilters): string {
  if (!filters) return "";

  const lines: string[] = [];
  if (filters.budget) lines.push(`- Budget: ${filters.budget}`);
  if (filters.founderSkills) lines.push(`- Skills: ${filters.founderSkills}`);
  if (filters.teamSize) lines.push(`- Team: ${filters.teamSize}`);
  if (filters.timeCommitment) lines.push(`- Time commitment: ${filters.timeCommitment}`);
  if (filters.revenueGoal) lines.push(`- Revenue goal: ${filters.revenueGoal}`);
  if (filters.deliveryModel) lines.push(`- Delivery model: ${filters.deliveryModel}`);
  if (filters.timeToRevenue) lines.push(`- Expected time to first revenue: ${filters.timeToRevenue}`);

  if (lines.length === 0) return "";
  return `\n\nFounder Context:\n${lines.join("\n")}`;
}

export async function generatePlan(
  idea: IdeaStub,
  category: string,
  location: string,
  filters?: DiscoveryFilters
): Promise<DayZeroPlan> {
  const client = getAnthropicClient();
  const founderContext = buildFounderContext(filters);
  const teamNote = filters?.teamSize
    ? `Every task in the 30-day plan must be actionable by a ${filters.teamSize.toLowerCase()}.`
    : "Every task in the 30-day plan must be actionable by a solo founder.";

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPTS.PLAN_GENERATOR,
    tool_choice: { type: "tool", name: "generate_plan" },
    tools: [PLAN_TOOL],
    messages: [
      {
        role: "user",
        content: `Create a Day Zero business plan for the following idea:

Title: ${idea.title}
Description: ${idea.one_liner}
Pain Point: ${idea.pain_point}
Target Audience: ${idea.target_audience}
Category: ${category}
Location: ${location}${founderContext}

Generate:
1. A complete Lean Canvas with all 9 sections
2. A revenue model with primary/secondary streams, pricing strategy, and revenue estimate
3. A 30-day go-to-market plan broken into 4 weeks, each with specific tasks and a milestone

Be specific to ${location} — mention local platforms, channels, pricing in local currency, and cultural considerations. ${teamNote}${filters?.budget ? ` The cost structure and initial investments must fit within a ${filters.budget} budget.` : ""}`,
      },
    ],
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return structured plan data");
  }
  return toolUse.input as DayZeroPlan;
}

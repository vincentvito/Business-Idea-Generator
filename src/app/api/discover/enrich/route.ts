import { NextRequest } from "next/server";
import { generatePlan } from "@/lib/ai/generate-plan";
import { createSSEStream } from "@/lib/pipeline/stream-helpers";
import { checkUsageLimit, recordUsage } from "@/lib/auth/check-usage";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { idea, category, location, filters } = body;

  if (!idea || !category || !location) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: idea, category, location" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Day Zero Plan is Pro-only — the key paywall
  const usage = await checkUsageLimit("enrich");
  if (!usage.isAuthenticated) {
    return new Response(
      JSON.stringify({ error: "auth_required", message: "Sign in to generate plans" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!usage.allowed) {
    return new Response(
      JSON.stringify({
        error: "usage_limit",
        message: "Day Zero Plans are available on the Pro plan. Upgrade to unlock.",
        used: usage.used,
        limit: usage.limit,
        tier: usage.tier,
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // Record usage
  await recordUsage(usage.userId!, "enrich", { idea, category, location });

  return createSSEStream(async (emit) => {
    emit({
      type: "stage_start",
      stage: "plan",
      message: "Generating your Day Zero business plan...",
    });

    const plan = await generatePlan(idea, category, location, filters);

    emit({ type: "stage_complete", stage: "plan", data: plan });
    emit({ type: "pipeline_complete", summary: { plan } });
  });
}

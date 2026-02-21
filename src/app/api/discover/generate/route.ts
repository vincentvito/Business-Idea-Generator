import { NextRequest } from "next/server";
import { runDiscoveryPipeline } from "@/lib/pipeline/discovery-pipeline";
import { createSSEStream } from "@/lib/pipeline/stream-helpers";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit/limiter";
import { checkUsageLimit, recordUsage } from "@/lib/auth/check-usage";
import type { DiscoveryFilters } from "@/types/discovery";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const category = body.category?.trim();
  const location = body.location?.trim();
  const filters: DiscoveryFilters | undefined = body.filters;

  if (!category || typeof category !== "string") {
    return new Response(
      JSON.stringify({ error: "Please provide a category" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!location || typeof location !== "string") {
    return new Response(
      JSON.stringify({ error: "Please provide a location" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Tier-based usage check
  const usage = await checkUsageLimit("discover");
  if (!usage.isAuthenticated) {
    return new Response(
      JSON.stringify({ error: "auth_required", message: "Sign in to discover ideas" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!usage.allowed) {
    return new Response(
      JSON.stringify({
        error: "usage_limit",
        message: `Free plan allows ${usage.limit} discovery session/month. Upgrade to Pro for unlimited.`,
        used: usage.used,
        limit: usage.limit,
        tier: usage.tier,
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // IP rate limit as secondary abuse protection
  const rateLimitResult = checkRateLimit("discover", getClientIP(request));
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rateLimitResult.retryAfter),
        },
      }
    );
  }

  // Record usage before running pipeline
  await recordUsage(usage.userId!, "discover", { category, location });

  return createSSEStream((emit) =>
    runDiscoveryPipeline(category, location, emit, filters)
  );
}

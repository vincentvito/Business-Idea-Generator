import { NextRequest } from "next/server";
import { runValidationPipeline } from "@/lib/pipeline/validation-pipeline";
import { createSSEStream } from "@/lib/pipeline/stream-helpers";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit/limiter";
import { checkUsageLimit, recordUsage } from "@/lib/auth/check-usage";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const idea = body.idea?.trim();

  if (!idea || typeof idea !== "string" || idea.length < 10) {
    return new Response(
      JSON.stringify({ error: "Please provide a food business idea (at least 10 characters)" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (idea.length > 1000) {
    return new Response(
      JSON.stringify({ error: "Business idea must be under 1000 characters" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Tier-based usage check
  const usage = await checkUsageLimit("validate");
  if (!usage.isAuthenticated) {
    return new Response(
      JSON.stringify({ error: "auth_required", message: "Sign in to validate ideas" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!usage.allowed) {
    return new Response(
      JSON.stringify({
        error: "usage_limit",
        message: `Free plan allows ${usage.limit} validations/month. Upgrade to Pro for unlimited.`,
        used: usage.used,
        limit: usage.limit,
        tier: usage.tier,
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // IP rate limit as secondary abuse protection
  const rateLimitResult = checkRateLimit("validate", getClientIP(request));
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
  await recordUsage(usage.userId!, "validate", { idea });

  return createSSEStream((emit) => runValidationPipeline(idea, emit));
}

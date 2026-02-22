import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { TIER_LIMITS, type Action, type TierName } from "./tier-limits";
import { AUTH_BYPASS_ENABLED } from "./bypass";

export interface UsageCheckResult {
  allowed: boolean;
  used: number;
  limit: number;
  tier: TierName;
  userId: string | null;
  isAuthenticated: boolean;
}

export async function checkUsageLimit(action: Action): Promise<UsageCheckResult> {
  // Dev bypass — skip auth + usage limits entirely
  if (AUTH_BYPASS_ENABLED) {
    return { allowed: true, used: 0, limit: Infinity, tier: "PRO", userId: "dev-user", isAuthenticated: true };
  }

  const session = await auth();

  if (!session?.user?.id) {
    return {
      allowed: false,
      used: 0,
      limit: 0,
      tier: "FREE",
      userId: null,
      isAuthenticated: false,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tier: true },
  });

  const tier = (user?.tier ?? "FREE") as TierName;
  const limit = TIER_LIMITS[tier][action];

  if (limit === Infinity) {
    return { allowed: true, used: 0, limit: Infinity, tier, userId: session.user.id, isAuthenticated: true };
  }

  if (limit === 0) {
    return { allowed: false, used: 0, limit: 0, tier, userId: session.user.id, isAuthenticated: true };
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const used = await prisma.usageRecord.count({
    where: {
      userId: session.user.id,
      action,
      createdAt: { gte: startOfMonth },
    },
  });

  return {
    allowed: used < limit,
    used,
    limit,
    tier,
    userId: session.user.id,
    isAuthenticated: true,
  };
}

export async function recordUsage(
  userId: string,
  action: string,
  metadata?: Record<string, unknown>
) {
  if (AUTH_BYPASS_ENABLED) return;

  await prisma.usageRecord.create({
    data: {
      userId,
      action,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
    },
  });
}

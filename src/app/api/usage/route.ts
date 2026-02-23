import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { TIER_LIMITS, type TierName } from "@/lib/auth/tier-limits";
import { AUTH_BYPASS_ENABLED } from "@/lib/auth/bypass";

export async function GET() {
  if (AUTH_BYPASS_ENABLED) {
    return Response.json({
      tier: "PRO",
      validate: { used: 0, limit: Infinity },
      discover: { used: 0, limit: Infinity },
    });
  }

  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tier: true },
  });

  const tier = (user?.tier ?? "FREE") as TierName;
  const limits = TIER_LIMITS[tier];

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usageCounts = await prisma.usageRecord.groupBy({
    by: ["action"],
    where: {
      userId: session.user.id,
      createdAt: { gte: startOfMonth },
    },
    _count: { action: true },
  });

  const usageMap: Record<string, number> = {};
  for (const row of usageCounts) {
    usageMap[row.action] = row._count.action;
  }

  return Response.json({
    tier,
    validate: { used: usageMap["validate"] ?? 0, limit: limits.validate },
    discover: { used: usageMap["discover"] ?? 0, limit: limits.discover },
  });
}

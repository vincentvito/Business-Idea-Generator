import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { AUTH_BYPASS_ENABLED } from "@/lib/auth/bypass";

const DEV_USER_ID = "dev-user";

function isBypassed() {
  return AUTH_BYPASS_ENABLED;
}

async function getAuthUserId(): Promise<{ userId: string | null; tier: string }> {
  if (isBypassed()) return { userId: DEV_USER_ID, tier: "PRO" };
  const session = await auth();
  if (!session?.user?.id) return { userId: null, tier: "FREE" };
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tier: true },
  });
  return { userId: session.user.id, tier: user?.tier ?? "FREE" };
}

export async function GET() {
  const { userId, tier } = await getAuthUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (tier === "FREE") {
    return Response.json({ error: "Pro plan required" }, { status: 403 });
  }

  if (isBypassed()) {
    return Response.json({ ideas: [] });
  }

  const ideas = await prisma.savedIdea.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return Response.json({ ideas });
}

export async function POST(request: NextRequest) {
  const { userId, tier } = await getAuthUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (tier === "FREE") {
    return Response.json({ error: "Pro plan required" }, { status: 403 });
  }

  const body = await request.json();
  const { ideaTitle, ideaData, category, score, source } = body;

  if (!ideaTitle || !category || !source) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (isBypassed()) {
    return Response.json({ idea: { id: "dev-idea", ideaTitle, category, score, source } }, { status: 201 });
  }

  const idea = await prisma.savedIdea.create({
    data: {
      userId,
      ideaTitle,
      ideaData: ideaData ?? {},
      category,
      score: score ?? null,
      source,
    },
  });

  return Response.json({ idea }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { userId } = await getAuthUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ideaId = searchParams.get("id");

  if (!ideaId) {
    return Response.json({ error: "Missing idea ID" }, { status: 400 });
  }

  if (!isBypassed()) {
    await prisma.savedIdea.deleteMany({
      where: { id: ideaId, userId },
    });
  }

  return Response.json({ success: true });
}

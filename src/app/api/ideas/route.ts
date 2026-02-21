import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tier: true },
  });

  if (user?.tier === "FREE") {
    return Response.json({ error: "Pro plan required" }, { status: 403 });
  }

  const ideas = await prisma.savedIdea.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return Response.json({ ideas });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tier: true },
  });

  if (user?.tier === "FREE") {
    return Response.json({ error: "Pro plan required" }, { status: 403 });
  }

  const body = await request.json();
  const { ideaTitle, ideaData, category, score, source } = body;

  if (!ideaTitle || !category || !source) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const idea = await prisma.savedIdea.create({
    data: {
      userId: session.user.id,
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
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ideaId = searchParams.get("id");

  if (!ideaId) {
    return Response.json({ error: "Missing idea ID" }, { status: 400 });
  }

  await prisma.savedIdea.deleteMany({
    where: { id: ideaId, userId: session.user.id },
  });

  return Response.json({ success: true });
}

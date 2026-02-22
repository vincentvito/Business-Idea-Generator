import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { AUTH_BYPASS_ENABLED } from "@/lib/auth/bypass";

export async function GET() {
  let userId: string;
  if (AUTH_BYPASS_ENABLED) {
    userId = "dev-user";
  } else {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;
  }

  const deepDives = await prisma.deepDive.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      ideaTitle: true,
      category: true,
      status: true,
      createdAt: true,
    },
  });

  return Response.json(deepDives);
}

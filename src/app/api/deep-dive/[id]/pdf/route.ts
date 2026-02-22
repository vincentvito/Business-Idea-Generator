import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { renderDeepDivePDF } from "@/lib/pdf/render-deep-dive";
import { AUTH_BYPASS_ENABLED } from "@/lib/auth/bypass";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Auth check (with bypass)
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

  const deepDive = await prisma.deepDive.findUnique({ where: { id } });
  if (!deepDive || deepDive.userId !== userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (deepDive.status !== "COMPLETED" && deepDive.status !== "IMAGES_PENDING") {
    return Response.json({ error: "Deep dive not ready yet" }, { status: 400 });
  }

  const pdfBuffer = await renderDeepDivePDF(deepDive);
  const filename = `deep-dive-${deepDive.ideaTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

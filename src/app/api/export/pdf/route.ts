import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { renderValidationPDF } from "@/lib/pdf/render";
import { AUTH_BYPASS_ENABLED } from "@/lib/auth/bypass";

export async function POST(request: NextRequest) {
  if (!AUTH_BYPASS_ENABLED) {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true },
    });

    if (user?.tier === "FREE") {
      return Response.json(
        { error: "PDF export is available on the Pro plan" },
        { status: 403 }
      );
    }
  }

  const body = await request.json();
  const { type, data } = body;

  if (type !== "validation") {
    return Response.json({ error: "Invalid export type" }, { status: 400 });
  }

  const pdfBuffer = await renderValidationPDF(data);

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="market-fit-${type}-report.pdf"`,
    },
  });
}

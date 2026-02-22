import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { renderValidationPDF, renderPlanPDF } from "@/lib/pdf/render";

export async function POST(request: NextRequest) {
  if (process.env.BYPASS_AUTH !== "true") {
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

  let pdfBuffer: Buffer;

  if (type === "validation") {
    pdfBuffer = await renderValidationPDF(data);
  } else if (type === "plan") {
    pdfBuffer = await renderPlanPDF(data);
  } else {
    return Response.json({ error: "Invalid export type" }, { status: 400 });
  }

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="market-fit-${type}-report.pdf"`,
    },
  });
}

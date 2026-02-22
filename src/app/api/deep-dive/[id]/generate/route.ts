import { prisma } from "@/lib/db/prisma";
import { generateDeepDiveContent } from "@/lib/ai/generate-deep-dive";
import {
  startMoodboardGeneration,
  buildMoodboardPrompts,
  buildLogoPrompt,
} from "@/lib/replicate/generate-moodboard";
import type { RankedIdea, DiscoveryFilters } from "@/types/discovery";

export const maxDuration = 120;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Verify internal webhook secret
  const secret = request.headers.get("x-webhook-secret");
  const expected = process.env.INTERNAL_WEBHOOK_SECRET ?? "dev-secret";
  if (secret !== expected) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const deepDive = await prisma.deepDive.findUnique({ where: { id } });
  if (!deepDive || deepDive.status !== "GENERATING") {
    return Response.json({ error: "Invalid deep dive" }, { status: 404 });
  }

  try {
    const idea = deepDive.ideaData as unknown as RankedIdea;
    const filters = deepDive.filters as unknown as DiscoveryFilters | undefined;

    // Step 1: Generate all text content via 5 parallel Claude calls
    const content = await generateDeepDiveContent(
      idea,
      deepDive.category,
      deepDive.location,
      filters
    );

    // Save text content immediately so the user sees it while images load
    await prisma.deepDive.update({
      where: { id },
      data: {
        businessPlan: JSON.parse(JSON.stringify(content.businessPlan)),
        brandNames: JSON.parse(JSON.stringify(content.brandNames)),
        devilsAdvocate: JSON.parse(JSON.stringify(content.devilsAdvocate)),
        validationRoadmap: JSON.parse(JSON.stringify(content.validationRoadmap)),
        menuOrProduct: JSON.parse(JSON.stringify(content.menuOrProduct)),
        marketingPlan: JSON.parse(JSON.stringify(content.marketingPlan)),
        status: "IMAGES_PENDING",
      },
    });

    // Step 2: Start Replicate image generation (async)
    try {
      const moodboardPrompts = buildMoodboardPrompts(
        idea.title,
        deepDive.category,
        content.brandNames.map((n) => n.name)
      );
      const logoPrompt = buildLogoPrompt(
        content.brandNames[0]?.name ?? idea.title,
        deepDive.category
      );

      const { predictionIds } = await startMoodboardGeneration(
        moodboardPrompts,
        logoPrompt
      );

      await prisma.deepDive.update({
        where: { id },
        data: { replicatePredictionIds: predictionIds },
      });
    } catch (imageError) {
      // Image generation failed but text is fine — mark as completed without images
      console.error("Replicate image generation failed:", imageError);
      await prisma.deepDive.update({
        where: { id },
        data: { status: "COMPLETED" },
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Deep dive generation failed:", error);
    await prisma.deepDive.update({
      where: { id },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    });
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}

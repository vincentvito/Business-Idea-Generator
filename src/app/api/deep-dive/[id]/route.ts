import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { pollPredictions } from "@/lib/replicate/generate-moodboard";
import type { DeepDiveData } from "@/types/deep-dive";
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

  // If images are pending, poll Replicate
  if (
    deepDive.status === "IMAGES_PENDING" &&
    deepDive.replicatePredictionIds
  ) {
    try {
      const predictionIds = deepDive.replicatePredictionIds as string[];
      const { completed, results } = await pollPredictions(predictionIds);

      if (completed) {
        // Last prediction is the logo, rest are moodboard images
        const moodboardImages = results
          .slice(0, -1)
          .filter(Boolean) as string[];
        const logoUrl = results[results.length - 1] ?? null;

        await prisma.deepDive.update({
          where: { id },
          data: {
            moodboardImages,
            logoUrl,
            status: "COMPLETED",
          },
        });

        const updated = await prisma.deepDive.findUnique({ where: { id } });
        return Response.json(formatResponse(updated!));
      }
    } catch {
      // Polling failed — return current data, client will retry
    }
  }

  return Response.json(formatResponse(deepDive));
}

function formatResponse(dd: {
  id: string;
  status: string;
  ideaTitle: string;
  ideaData: unknown;
  category: string;
  location: string;
  businessPlan: unknown;
  brandNames: unknown;
  devilsAdvocate: unknown;
  validationRoadmap: unknown;
  menuOrProduct: unknown;
  marketingPlan: unknown;
  moodboardImages: unknown;
  logoUrl: string | null;
  errorMessage: string | null;
  createdAt: Date;
}): DeepDiveData {
  const moodboardImages = dd.moodboardImages as string[] | null;
  return {
    id: dd.id,
    status: dd.status as DeepDiveData["status"],
    ideaTitle: dd.ideaTitle,
    ideaData: dd.ideaData as DeepDiveData["ideaData"],
    category: dd.category,
    location: dd.location,
    businessPlan: dd.businessPlan as DeepDiveData["businessPlan"],
    brandNames: dd.brandNames as DeepDiveData["brandNames"],
    devilsAdvocate: dd.devilsAdvocate as DeepDiveData["devilsAdvocate"],
    validationRoadmap: dd.validationRoadmap as DeepDiveData["validationRoadmap"],
    menuOrProduct: dd.menuOrProduct as DeepDiveData["menuOrProduct"],
    marketingPlan: dd.marketingPlan as DeepDiveData["marketingPlan"],
    moodboard:
      moodboardImages || dd.logoUrl
        ? {
            images: moodboardImages ?? [],
            logo_url: dd.logoUrl,
            color_palette: [],
            style_keywords: [],
          }
        : null,
    errorMessage: dd.errorMessage,
    createdAt: dd.createdAt.toISOString(),
  };
}

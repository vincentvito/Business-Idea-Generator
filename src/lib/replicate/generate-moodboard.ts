import { getReplicateClient } from "./client";

const NANO_BANANA_MODEL = "google/nano-banana";
const RECRAFT_SVG_MODEL = "recraft-ai/recraft-v3-svg";

export function buildMoodboardPrompts(
  ideaTitle: string,
  category: string,
  brandNames: string[]
): string[] {
  const firstName = brandNames[0] ?? ideaTitle;
  return [
    `Modern minimalist brand identity for "${firstName}", ${category} industry, professional clean design, brand colors, high quality`,
    `Product mockup and lifestyle scene for "${ideaTitle}", ${category}, photorealistic, warm lighting, aspirational`,
    `Social media promotional design for "${firstName}", modern ${category} brand, vibrant, eye-catching, contemporary`,
    `Website hero section design for "${ideaTitle}", ${category} startup, clean UI, professional, modern`,
  ];
}

export function buildLogoPrompt(brandName: string, category: string): string {
  return `Minimalist logo for "${brandName}", ${category} brand, clean vector icon, modern professional, simple geometric, white background`;
}

export async function startMoodboardGeneration(
  prompts: string[],
  logoPrompt: string
): Promise<{ predictionIds: string[]; logoIsLast: boolean }> {
  const replicate = getReplicateClient();

  const predictions = await Promise.all([
    // Moodboard images via nano-banana
    ...prompts.map((prompt) =>
      replicate.predictions.create({
        model: NANO_BANANA_MODEL,
        input: {
          prompt,
          aspect_ratio: "1:1",
          output_format: "png",
        },
      })
    ),
    // Logo via recraft SVG
    replicate.predictions.create({
      model: RECRAFT_SVG_MODEL,
      input: {
        prompt: logoPrompt,
        size: "1024x1024",
        style: "any",
      },
    }),
  ]);

  return {
    predictionIds: predictions.map((p) => p.id),
    logoIsLast: true,
  };
}

export async function pollPredictions(
  predictionIds: string[]
): Promise<{ completed: boolean; results: (string | null)[] }> {
  const replicate = getReplicateClient();
  const results: (string | null)[] = [];
  let allCompleted = true;

  for (const id of predictionIds) {
    const prediction = await replicate.predictions.get(id);

    if (prediction.status === "succeeded") {
      const output = prediction.output;
      if (Array.isArray(output)) {
        // nano-banana returns array of URL strings
        results.push(typeof output[0] === "string" ? output[0] : String(output[0]));
      } else if (typeof output === "string") {
        results.push(output);
      } else {
        results.push(null);
      }
    } else if (
      prediction.status === "failed" ||
      prediction.status === "canceled"
    ) {
      results.push(null);
    } else {
      // Still processing
      allCompleted = false;
      results.push(null);
    }
  }

  return { completed: allCompleted, results };
}

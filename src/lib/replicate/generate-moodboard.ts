import { getReplicateClient } from "./client";

const NANO_BANANA_MODEL = "google/nano-banana";
const RECRAFT_SVG_MODEL = "recraft-ai/recraft-v3-svg";

const CATEGORY_MOODBOARD_TEMPLATES: Record<string, string[]> = {
  "Restaurant & Dining": [
    'Professional food photography of a signature plated dish for "{brand}", {category}, overhead angle, natural lighting, rustic table setting, appetizing colors',
    'Interior ambiance design for "{idea}" restaurant, warm lighting, modern {category} aesthetic, inviting atmosphere, detail-oriented decor',
    'Elegant printed menu design for "{brand}", {category} brand, clean typography, premium paper texture, curated layout',
    'Inviting restaurant entrance and storefront for "{idea}", street view, modern signage, warm glow from inside, welcoming',
  ],
  "Food Truck & Street Food": [
    'Eye-catching food truck wrap design for "{brand}", bold colors, {category} style, appetizing food imagery, street-level view',
    'Vibrant street food scene with "{idea}" truck, customers lined up, urban setting, natural daylight, festival atmosphere',
    'Hand-lettered menu board design for "{brand}", chalkboard style, {category} items, clear pricing, rustic charm',
    'Branded takeaway packaging and containers for "{idea}", eco-friendly materials, bold logo placement, street food aesthetic',
  ],
  "Bakery & Pastry": [
    'Artisan bread and pastry display for "{brand}", warm bakery lighting, rustic wooden shelves, golden-baked goods, inviting',
    'Elegant cake and pastry close-up for "{idea}", macro photography, delicate frosting details, pastel colors, premium quality',
    'Cozy bakery interior design for "{brand}", open kitchen concept, flour-dusted surfaces, warm tones, artisan {category} vibe',
    'Branded bakery packaging — boxes, bags, and ribbons for "{idea}", minimalist design, premium materials, gift-worthy presentation',
  ],
  "Catering & Events": [
    'Stunning event catering spread for "{brand}", long banquet table, elegant plating, floral accents, high-end {category} styling',
    'Professional catering staff and branded setup for "{idea}", corporate event setting, clean presentation, team uniforms',
    "Detailed appetizer platter and hors d'oeuvres for \"{brand}\", cocktail party style, miniature portions, artistic arrangement",
    'Branded catering brochure and proposal design for "{idea}", premium paper, professional typography, food photography highlights',
  ],
  "Ghost Kitchen & Delivery-Only": [
    'Premium delivery packaging and unboxing experience for "{brand}", branded containers, sealed freshness, {category} professional',
    'Delivery app listing mockup for "{idea}", appetizing hero photo, clean UI, 4.8-star rating, compelling description',
    'Behind-the-scenes ghost kitchen operation for "{brand}", professional kitchen setup, organized stations, efficient workflow',
    'Social media carousel design for "{idea}", delivery promo, order-now CTA, vibrant food photos, mobile-optimized layout',
  ],
  "Bar, Pub & Nightlife": [
    'Signature cocktail photography for "{brand}", dramatic lighting, craft garnish, dark moody bar backdrop, {category} ambiance',
    'Stylish bar interior design for "{idea}", ambient lighting, bar stools, bottle display, industrial-chic or speakeasy aesthetic',
    'Cocktail menu design for "{brand}", dark background, gold accents, craft typography, premium {category} branding',
    'Bar entrance and neon signage for "{idea}", nighttime street view, atmospheric glow, inviting storefront, urban setting',
  ],
  "Café & Coffee Shop": [
    'Takeaway cup design and branded coffee sleeve for "{brand}", clean minimalist branding, latte art visible, {category} aesthetic',
    'Cozy café interior with warm lighting for "{idea}", comfortable seating, exposed brick, plants, Instagram-worthy corners',
    'Latte art and specialty coffee close-up for "{brand}", top-down view, ceramic cup, pastry pairing, natural lighting',
    'Café storefront and outdoor seating for "{idea}", charming street-level view, branded awning, chalkboard specials outside',
  ],
  "Meal Prep & Subscription": [
    'Meal prep container lineup for "{brand}", organized meal portions, colorful ingredients, clean presentation, {category} branding',
    'Subscription box unboxing experience for "{idea}", branded packaging, recipe cards, fresh ingredients, lifestyle flat-lay',
    'Weekly meal plan layout for "{brand}", 5-7 meals photographed top-down, variety of cuisines, portion-controlled, appetizing',
    'Mobile app mockup for "{idea}" subscription service, clean UI, meal selection screen, nutritional info, easy ordering flow',
  ],
  "Beverage Brand": [
    'Product bottle or can design for "{brand}", studio photography, clean background, label detail, premium {category} packaging',
    'Lifestyle shot with "{idea}" beverage, outdoor setting, active or social scene, aspirational, natural lighting',
    'Retail shelf display mockup for "{brand}", grocery store setting, eye-level placement, competitive shelf presence',
    'Label design close-up for "{idea}", ingredient callouts, nutritional highlights, brand story, craft typography detail',
  ],
  "Food Product & Packaged Goods": [
    'Product packaging design for "{brand}", studio shot, clean white background, multiple SKUs, premium shelf appeal',
    'Retail shelf display and point-of-sale for "{idea}", grocery store context, branded shelf talker, competitive placement',
    'Ingredient flat-lay and recipe inspiration for "{brand}", raw ingredients artfully arranged, cooking scene, lifestyle feel',
    'Product unboxing and DTC packaging for "{idea}", subscription box style, branded tissue paper, thank-you card, premium feel',
  ],
  "Food Tech & SaaS": [
    'Dashboard UI design for "{brand}" platform, modern SaaS interface, data visualizations, clean layout, dark and light mode',
    'Mobile app screens for "{idea}", restaurant owner using the app, order management, intuitive UX, professional tech aesthetic',
    'Workflow diagram showing how "{brand}" saves time, before and after comparison, clean infographic style, tech-forward design',
    'Analytics and reporting screen for "{idea}", charts, KPI cards, revenue tracking, modern {category} dashboard aesthetic',
  ],
  "Grocery & Specialty Retail": [
    'Curated store display and merchandising for "{brand}", artisan products, wooden shelving, warm lighting, boutique {category} feel',
    'Storefront design and entrance for "{idea}", inviting window display, brand signage, specialty items visible, charming exterior',
    'Product sampling and tasting station for "{brand}", in-store experience, customer engagement, curated selection',
    'Online store mockup for "{idea}", e-commerce product grid, category navigation, professional product photography, clean UI',
  ],
};

export function buildMoodboardPrompts(
  ideaTitle: string,
  category: string,
  brandNames: string[]
): string[] {
  const firstName = brandNames[0] ?? ideaTitle;
  const templates = CATEGORY_MOODBOARD_TEMPLATES[category];

  if (!templates) {
    return [
      `Modern minimalist brand identity for "${firstName}", ${category} industry, professional clean design, brand colors, high quality`,
      `Product mockup and lifestyle scene for "${ideaTitle}", ${category}, photorealistic, warm lighting, aspirational`,
      `Social media promotional design for "${firstName}", modern ${category} brand, vibrant, eye-catching, contemporary`,
      `Website hero section design for "${ideaTitle}", ${category} startup, clean UI, professional, modern`,
    ];
  }

  return templates.map((template) =>
    template
      .replace(/\{brand\}/g, firstName)
      .replace(/\{idea\}/g, ideaTitle)
      .replace(/\{category\}/g, category)
  );
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

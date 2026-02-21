export const CATEGORIES = [
  "Fitness & Wellness",
  "Food & Beverage",
  "E-commerce & Retail",
  "SaaS & Software",
  "Education & Training",
  "Health & Medical",
  "Real Estate",
  "Finance & Fintech",
  "Travel & Hospitality",
  "Beauty & Personal Care",
  "Pet Services",
  "Home Services",
  "Sustainability & Green",
  "Entertainment & Media",
  "Childcare & Parenting",
  "Professional Services",
  "Automotive",
  "Fashion & Apparel",
  "Agriculture & Food Tech",
  "Social Impact",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const POPULAR_LOCATIONS = [
  "New York, USA",
  "Los Angeles, USA",
  "London, UK",
  "Dubai, UAE",
  "Milan, Italy",
  "Berlin, Germany",
  "Paris, France",
  "Toronto, Canada",
  "Sydney, Australia",
  "Singapore",
  "Tokyo, Japan",
  "Mumbai, India",
  "São Paulo, Brazil",
  "Amsterdam, Netherlands",
  "Stockholm, Sweden",
] as const;

export const VALIDATION_STAGES = [
  { id: "keywords", label: "Extracting keywords", icon: "Search" },
  { id: "metrics", label: "Fetching search data", icon: "BarChart3" },
  { id: "trends", label: "Analyzing trends", icon: "TrendingUp" },
  { id: "competitors", label: "Analyzing competitors", icon: "Users" },
  { id: "ecommerce", label: "Checking Amazon data", icon: "ShoppingCart" },
  { id: "scoring", label: "Computing scores", icon: "Target" },
] as const;

export const DISCOVERY_STAGES = [
  { id: "seeding", label: "Researching market demand", icon: "Search" },
  { id: "generation", label: "Generating ideas", icon: "Lightbulb" },
  { id: "volume_check", label: "Checking search volume", icon: "BarChart3" },
  { id: "ranking", label: "Finding opportunities", icon: "Trophy" },
] as const;

export const BUDGET_RANGES = [
  "Below $1K",
  "$1K–$5K",
  "$5K–$15K",
  "$15K–$50K",
  "$50K+",
] as const;

export const BUSINESS_MODELS = [
  "Service-based",
  "Product / E-commerce",
  "SaaS / Digital product",
  "Marketplace / Platform",
  "Content / Media",
] as const;

export const TIME_COMMITMENTS = [
  "Weekend project",
  "Side project (10-20h/week)",
  "Full-time",
] as const;

export const REVENUE_GOALS = [
  "$1K–$3K/mo (side income)",
  "$3K–$10K/mo (full-time)",
  "$10K–$50K/mo (growth)",
  "$50K+/mo (scale)",
] as const;

export const TARGET_MARKETS = ["B2B", "B2C", "Both"] as const;

export const TEAM_SIZES = [
  "Solo founder",
  "Small team (2-5)",
  "Team (5+)",
] as const;

export const DELIVERY_MODELS = [
  "Online-only",
  "Local / Physical",
  "Hybrid",
] as const;

export const TIME_TO_REVENUE = [
  "Under 1 month",
  "1–3 months",
  "3–6 months",
  "6+ months",
] as const;

export const CATEGORY_SEED_KEYWORDS: Record<string, string[]> = {
  "Fitness & Wellness": ["fitness", "gym", "workout", "personal trainer", "wellness"],
  "Food & Beverage": ["restaurant", "food delivery", "catering", "meal prep", "coffee shop"],
  "E-commerce & Retail": ["online store", "dropshipping", "retail", "ecommerce", "wholesale"],
  "SaaS & Software": ["software", "app", "automation", "project management", "CRM"],
  "Education & Training": ["online course", "tutoring", "training", "coaching", "certification"],
  "Health & Medical": ["healthcare", "telemedicine", "therapy", "medical", "mental health"],
  "Real Estate": ["real estate", "property management", "rental", "mortgage", "home buying"],
  "Finance & Fintech": ["fintech", "investing", "accounting", "payment", "insurance"],
  "Travel & Hospitality": ["travel", "hotel", "vacation rental", "tour", "booking"],
  "Beauty & Personal Care": ["beauty", "skincare", "salon", "cosmetics", "hair care"],
  "Pet Services": ["pet care", "dog grooming", "pet sitting", "veterinary", "pet food"],
  "Home Services": ["home cleaning", "plumbing", "landscaping", "handyman", "renovation"],
  "Sustainability & Green": ["sustainable", "solar energy", "recycling", "eco-friendly", "green products"],
  "Entertainment & Media": ["streaming", "gaming", "podcast", "content creation", "events"],
  "Childcare & Parenting": ["childcare", "daycare", "parenting", "baby products", "nanny"],
  "Professional Services": ["consulting", "legal services", "marketing agency", "freelance", "recruitment"],
  "Automotive": ["car repair", "auto parts", "car wash", "electric vehicle", "car rental"],
  "Fashion & Apparel": ["fashion", "clothing brand", "streetwear", "accessories", "custom apparel"],
  "Agriculture & Food Tech": ["farming", "organic food", "food tech", "vertical farming", "agriculture"],
  "Social Impact": ["nonprofit", "social enterprise", "community", "charity", "volunteer"],
};

export const CATEGORY_ICONS: Record<string, string> = {
  "Fitness & Wellness": "Dumbbell",
  "Food & Beverage": "UtensilsCrossed",
  "E-commerce & Retail": "ShoppingCart",
  "SaaS & Software": "Code",
  "Education & Training": "GraduationCap",
  "Health & Medical": "Heart",
  "Real Estate": "Building2",
  "Finance & Fintech": "Wallet",
  "Travel & Hospitality": "Plane",
  "Beauty & Personal Care": "Sparkles",
  "Pet Services": "PawPrint",
  "Home Services": "Wrench",
  "Sustainability & Green": "Leaf",
  "Entertainment & Media": "Film",
  "Childcare & Parenting": "Baby",
  "Professional Services": "Briefcase",
  "Automotive": "Car",
  "Fashion & Apparel": "Shirt",
  "Agriculture & Food Tech": "Wheat",
  "Social Impact": "HandHeart",
};

export const CATEGORIES = [
  "Restaurant & Dining",
  "Food Truck & Street Food",
  "Bakery & Pastry",
  "Catering & Events",
  "Ghost Kitchen & Delivery-Only",
  "Bar, Pub & Nightlife",
  "Café & Coffee Shop",
  "Meal Prep & Subscription",
  "Beverage Brand",
  "Food Product & Packaged Goods",
  "Food Tech & SaaS",
  "Grocery & Specialty Retail",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const POPULAR_CATEGORIES: Array<{
  name: Category;
  description: string;
}> = [
  { name: "Restaurant & Dining", description: "Full-service, fast-casual, or fine dining" },
  { name: "Café & Coffee Shop", description: "Specialty coffee, brunch spots, tea houses" },
  { name: "Food Truck & Street Food", description: "Mobile kitchens, food carts, pop-ups" },
  { name: "Bakery & Pastry", description: "Artisan bread, custom cakes, pastry shops" },
  { name: "Ghost Kitchen & Delivery-Only", description: "Cloud kitchens, virtual restaurant brands" },
];

export const MENU_CATEGORIES = [
  "Restaurant & Dining",
  "Food Truck & Street Food",
  "Bakery & Pastry",
  "Catering & Events",
  "Ghost Kitchen & Delivery-Only",
  "Bar, Pub & Nightlife",
  "Café & Coffee Shop",
  "Meal Prep & Subscription",
] as const;

export function isMenuCategory(category: string): boolean {
  return (MENU_CATEGORIES as readonly string[]).includes(category);
}

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
  { id: "local_competition", label: "Scanning local competitors", icon: "MapPin" },
  { id: "ecommerce", label: "Checking marketplace data", icon: "ShoppingCart" },
  { id: "scoring", label: "Computing scores", icon: "Target" },
] as const;

export const DISCOVERY_STAGES = [
  { id: "seeding", label: "Researching food market demand", icon: "Search" },
  { id: "generation", label: "Generating food business ideas", icon: "Lightbulb" },
  { id: "volume_check", label: "Checking search volume", icon: "BarChart3" },
  { id: "ranking", label: "Finding opportunities", icon: "Trophy" },
] as const;

export const BUDGET_RANGES = [
  "Below $1K",
  "$1K–$5K",
  "$5K–$15K",
  "$15K–$50K",
  "$50K–$150K",
  "$150K+",
] as const;

export const BUSINESS_MODELS = [
  "Dine-in / Takeaway",
  "Delivery-only / Ghost Kitchen",
  "Product / Packaged Goods",
  "Catering / Events",
  "Subscription / Meal Prep",
  "Franchise / Multi-location",
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

export const TARGET_MARKETS = [
  "B2B",
  "B2C",
  "Both (B2B + B2C)",
  "Families",
  "Young Professionals",
  "Health-Conscious",
  "Foodies & Enthusiasts",
] as const;

export const TEAM_SIZES = [
  "Solo founder",
  "Small crew (2-5 staff)",
  "Full kitchen team (5+)",
] as const;

export const DELIVERY_MODELS = [
  "Dine-in only",
  "Delivery & Takeaway",
  "Delivery-only",
  "Hybrid (dine-in + delivery)",
  "Pop-up / Mobile",
] as const;

export const TIME_TO_FIRST_SALE = [
  "Under 1 month",
  "1–3 months",
  "3–6 months",
  "6+ months",
] as const;

export const CUISINE_SPECIALTIES = [
  "Italian",
  "Asian Fusion",
  "Mexican / Latin",
  "Mediterranean",
  "American Comfort",
  "Japanese / Sushi",
  "Indian",
  "Vegan / Plant-Based",
  "Organic & Farm-to-Table",
  "BBQ & Smoked",
  "Desserts & Sweets",
  "Seafood",
  "Middle Eastern",
  "No Specific Cuisine",
] as const;

export const CATEGORY_SEED_KEYWORDS: Record<string, string[]> = {
  "Restaurant & Dining": ["restaurant near me", "fine dining", "casual restaurant", "family restaurant", "ethnic restaurant", "restaurant opening"],
  "Food Truck & Street Food": ["food truck", "street food", "mobile kitchen", "food cart", "food truck catering", "food truck menu"],
  "Bakery & Pastry": ["bakery near me", "artisan bread", "pastry shop", "custom cakes", "sourdough bakery", "gluten free bakery"],
  "Catering & Events": ["catering service", "event catering", "wedding catering", "corporate catering", "private chef", "party food"],
  "Ghost Kitchen & Delivery-Only": ["ghost kitchen", "cloud kitchen", "delivery only restaurant", "virtual restaurant", "dark kitchen", "food delivery"],
  "Bar, Pub & Nightlife": ["cocktail bar", "craft beer bar", "wine bar", "pub food", "nightclub", "speakeasy"],
  "Café & Coffee Shop": ["coffee shop", "specialty coffee", "café near me", "brunch spot", "tea house", "coffee roaster"],
  "Meal Prep & Subscription": ["meal prep delivery", "meal kit", "healthy meal delivery", "diet meal plan", "food subscription box", "weekly meal prep"],
  "Beverage Brand": ["juice bar", "smoothie bar", "kombucha brand", "cold brew coffee", "energy drink", "craft soda"],
  "Food Product & Packaged Goods": ["hot sauce brand", "spice blend", "artisan pasta", "snack brand", "organic food product", "specialty condiment"],
  "Food Tech & SaaS": ["restaurant management software", "food ordering system", "restaurant POS", "kitchen management", "food waste app", "restaurant analytics"],
  "Grocery & Specialty Retail": ["specialty grocery", "organic grocery store", "cheese shop", "wine shop", "butcher shop", "gourmet food store"],
};

export const CATEGORY_ICONS: Record<string, string> = {
  "Restaurant & Dining": "UtensilsCrossed",
  "Food Truck & Street Food": "Truck",
  "Bakery & Pastry": "CakeSlice",
  "Catering & Events": "PartyPopper",
  "Ghost Kitchen & Delivery-Only": "ChefHat",
  "Bar, Pub & Nightlife": "Wine",
  "Café & Coffee Shop": "Coffee",
  "Meal Prep & Subscription": "Package",
  "Beverage Brand": "GlassWater",
  "Food Product & Packaged Goods": "ShoppingBasket",
  "Food Tech & SaaS": "Monitor",
  "Grocery & Specialty Retail": "Store",
};

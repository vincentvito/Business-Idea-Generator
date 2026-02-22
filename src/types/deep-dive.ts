import type { RankedIdea } from "./discovery";

// === Business Plan Basics ===

export interface ExecutiveSummary {
  overview: string;
  value_proposition: string;
  business_model: string;
  target_market_summary: string;
}

export interface MissionVision {
  mission: string;
  vision: string;
  core_values: string[];
}

export interface TargetMarketAnalysis {
  primary_segment: string;
  segment_size: string;
  demographics: string[];
  psychographics: string[];
  pain_points: string[];
  buying_behavior: string;
}

export interface CompetitiveAdvantage {
  direct_competitors: Array<{
    name: string;
    weakness: string;
  }>;
  indirect_competitors: string[];
  your_differentiators: string[];
  moat_strategy: string;
}

export interface FinancialProjections {
  startup_costs: Array<{ item: string; amount: string }>;
  monthly_operating_costs: Array<{ item: string; amount: string }>;
  revenue_projections: Array<{
    month: number;
    revenue: string;
    notes: string;
  }>;
  break_even_timeline: string;
  funding_needed: string;
}

export interface BusinessPlanBasics {
  executive_summary: ExecutiveSummary;
  mission_vision: MissionVision;
  target_market: TargetMarketAnalysis;
  competitive_advantage: CompetitiveAdvantage;
  financial_projections: FinancialProjections;
}

// === Brand Names ===

export interface BrandNameSuggestion {
  name: string;
  tagline: string;
  reasoning: string;
  domain_suggestion: string;
  style: "playful" | "professional" | "modern" | "classic" | "techy";
}

// === Devil's Advocate ===

export interface DevilsAdvocate {
  critical_risks: Array<{
    risk: string;
    severity: "high" | "medium" | "low";
    likelihood: "high" | "medium" | "low";
    mitigation: string;
  }>;
  failure_modes: Array<{
    scenario: string;
    trigger: string;
    prevention: string;
  }>;
  market_challenges: string[];
  execution_challenges: string[];
  financial_challenges: string[];
  honest_assessment: string;
}

// === Validation Roadmap ===

export interface RoadmapStep {
  id: string;
  week: number;
  title: string;
  description: string;
  action_items: string[];
  success_criteria: string;
  estimated_hours: number;
  category: "research" | "build" | "launch" | "measure";
}

export interface ValidationRoadmap {
  phases: Array<{
    phase: number;
    name: string;
    steps: RoadmapStep[];
  }>;
  total_estimated_weeks: number;
  total_estimated_budget: string;
}

// === Menu Engineering (food-service categories) ===

export interface MenuItem {
  name: string;
  description: string;
  price: string;
  food_cost_percent: number;
  profit_margin_percent: number;
  category: string;
  classification: "star" | "plowhorse" | "puzzle" | "dog";
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface MenuEngineering {
  menu_categories: MenuCategory[];
  pricing_strategy: string;
  upsell_recommendations: string[];
  combo_strategies: Array<{
    name: string;
    items: string[];
    bundle_price: string;
    savings_percent: number;
  }>;
  food_cost_summary: {
    average_food_cost_percent: number;
    target_food_cost_percent: number;
    recommendations: string[];
  };
  stars_summary: string;
  plowhorses_summary: string;
  puzzles_summary: string;
  dogs_summary: string;
}

// === Product Lineup (non-menu categories) ===

export interface ProductItem {
  name: string;
  description: string;
  price: string;
  cost_to_produce: string;
  margin_percent: number;
  category: string;
  classification: "hero" | "cash_cow" | "growth" | "niche";
}

export interface ProductLineup {
  products: ProductItem[];
  pricing_strategy: string;
  bundle_strategies: Array<{
    name: string;
    products: string[];
    bundle_price: string;
    value_proposition: string;
  }>;
  margin_summary: {
    average_margin_percent: number;
    target_margin_percent: number;
    recommendations: string[];
  };
  distribution_channels: string[];
  product_roadmap: string;
}

export type MenuOrProductData =
  | { type: "menu"; data: MenuEngineering }
  | { type: "product_lineup"; data: ProductLineup };

// === Marketing Plan ===

export interface MarketingChannel {
  channel: string;
  strategy: string;
  budget_allocation_percent: number;
  expected_roi: string;
  priority: "high" | "medium" | "low";
}

export interface ContentCalendarWeek {
  week: number;
  theme: string;
  posts: Array<{
    platform: string;
    content_type: string;
    topic: string;
    caption_idea: string;
  }>;
}

export interface MarketingPlan {
  overview: string;
  total_budget: string;
  channels: MarketingChannel[];
  content_calendar: ContentCalendarWeek[];
  pre_launch_tactics: string[];
  launch_week_tactics: string[];
  ongoing_tactics: string[];
  kpis: Array<{
    metric: string;
    target: string;
    measurement_tool: string;
  }>;
  local_seo_checklist: string[];
  influencer_strategy: {
    target_type: string;
    outreach_template: string;
    budget_per_influencer: string;
    expected_reach: string;
  };
}

// === Moodboard ===

export interface MoodboardData {
  images: string[];
  logo_url: string | null;
  color_palette: string[];
  style_keywords: string[];
}

// === Complete Deep Dive ===

export interface DeepDiveData {
  id: string;
  status: "PENDING" | "GENERATING" | "IMAGES_PENDING" | "COMPLETED" | "FAILED";
  ideaTitle: string;
  ideaData: RankedIdea;
  category: string;
  location: string;
  businessPlan: BusinessPlanBasics | null;
  brandNames: BrandNameSuggestion[] | null;
  devilsAdvocate: DevilsAdvocate | null;
  validationRoadmap: ValidationRoadmap | null;
  menuOrProduct: MenuOrProductData | null;
  marketingPlan: MarketingPlan | null;
  moodboard: MoodboardData | null;
  errorMessage: string | null;
  createdAt: string;
}

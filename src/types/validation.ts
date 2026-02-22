export interface KeywordData {
  keyword: string;
  intent: "informational" | "commercial" | "transactional" | "navigational";
  relevance: number;
}

export interface KeywordExtractionResult {
  keywords: KeywordData[];
  niche: string;
  location: string;
  category: string;
}

export interface KeywordMetrics {
  keyword: string;
  avg_monthly_searches: number;
  competition: "LOW" | "MEDIUM" | "HIGH" | "UNSPECIFIED";
  competition_index: number;
  low_top_of_page_bid: number;
  high_top_of_page_bid: number;
  monthly_searches?: { year: number; month: number; search_volume: number }[];
  cpc?: number;
}

export interface CompetitorData {
  position: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  displayed_link: string;
  sitelinks: number;
  rich_snippet: boolean;
  date: string | null;
  featured_snippet?: boolean;
}

export interface CompetitorAnalysis {
  name: string;
  url: string;
  strengths: string[];
  weaknesses: string[];
  estimated_authority: "low" | "medium" | "high";
  differentiation_opportunity: string;
}

export interface MoatAnalysis {
  overall_competition_level: "low" | "medium" | "high" | "very_high";
  biggest_gap: string;
  recommended_positioning: string;
  unfair_advantages_to_build: string[];
}

export interface CompetitorMoatResult {
  competitors: CompetitorAnalysis[];
  moat_analysis: MoatAnalysis;
}

export interface TrendData {
  keyword: string;
  timeline: { date: string; value: number }[];
  trend_direction: "rising" | "stable" | "declining";
  growth_percentage: number;
}

export interface AmazonProductData {
  keyword: string;
  total_products: number;
  top_products: {
    title: string;
    price: number;
    rating: number;
    reviews_count: number;
    asin: string;
    seller: string;
    is_amazon_choice?: boolean;
    is_best_seller?: boolean;
  }[];
  avg_price: number;
  avg_rating: number;
  amazon_search_volume?: number;
}

export interface ScoreData {
  overall_score: number;
  market_demand_score: number;
  competition_score: number;
  monetization_score: number;
  timing_score: number;
  ecommerce_score?: number;
  local_competition_score?: number;
  verdict: "strong" | "promising" | "risky" | "weak";
  one_liner: string;
  key_risks: string[];
  next_steps: string[];
}

// ─── Local Competition (Google Maps) ───

export interface LocalCompetitorData {
  name: string;
  rating: number;
  reviews_count: number;
  address: string;
  phone: string | null;
  category: string | null;
  price_level: string | null;
  url: string | null;
  latitude: number | null;
  longitude: number | null;
  is_claimed: boolean;
}

export interface LocalCompetitorDetail {
  name: string;
  rating: number;
  reviews_count: number;
  rating_distribution: Record<string, number> | null;
  address: string;
  phone: string | null;
  url: string | null;
  category: string | null;
  additional_categories: string[];
  price_level: string | null;
  total_photos: number;
  is_claimed: boolean;
  attributes: Record<string, string[]> | null;
  popular_times: Record<string, Array<{ time: number; popular_index: number }>> | null;
}

export interface LocalCompetitionData {
  query: string;
  location: string;
  total_competitors: number;
  avg_rating: number;
  avg_reviews: number;
  rating_distribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  top_competitors: LocalCompetitorData[];
  detailed_competitors: LocalCompetitorDetail[];
  saturation_level: "low" | "moderate" | "high" | "very_high";
}

export interface ValidationResult {
  idea: string;
  keywords: KeywordExtractionResult;
  metrics: KeywordMetrics[];
  trends: TrendData[];
  competitors: CompetitorAnalysis[];
  moat: MoatAnalysis;
  amazon: AmazonProductData[];
  localCompetition: LocalCompetitionData | null;
  scores: ScoreData;
}

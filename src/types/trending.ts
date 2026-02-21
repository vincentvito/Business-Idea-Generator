export interface TrendingNiche {
  id: string;
  name: string;
  category: string;
  searchVolume: number;
  growthPercent: number;
  monthlyData: number[];
  relatedKeywords: string[];
  competitionLevel: "low" | "medium" | "high";
  opportunity: "rising" | "stable" | "declining";
}

export interface CategoryStats {
  category: string;
  totalIdeas: number;
  avgScore: number;
  goldilocksCount: number;
  topNiche: string;
}

import type { KeywordMetrics } from "./validation";

export interface DiscoveryFilters {
  budget?: string;
  businessModel?: string;
  founderSkills?: string;
  timeCommitment?: string;
  revenueGoal?: string;
  targetMarket?: string;
  teamSize?: string;
  deliveryModel?: string;
  timeToRevenue?: string;
  cuisineSpecialty?: string;
}

export interface IdeaStub {
  id: number;
  title: string;
  one_liner: string;
  pain_point: string;
  target_audience: string;
  suggested_keywords: string[];
}

export interface RankedIdea extends IdeaStub {
  totalVolume: number;
  avgCompetition: number;
  avgCPC: number;
  isGoldilocks: boolean;
  score: number;
  metrics: KeywordMetrics[];
}

export interface DiscoveryResult {
  ideas: RankedIdea[];
  goldilocksIdeas: RankedIdea[];
  dataSource?: "mock" | "live";
  totalGenerated?: number;
}

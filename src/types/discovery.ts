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

export interface LeanCanvas {
  problem: string[];
  solution: string[];
  unique_value_proposition: string;
  unfair_advantage: string;
  customer_segments: string[];
  key_metrics: string[];
  channels: string[];
  cost_structure: string[];
  revenue_streams: string[];
}

export interface RevenueModel {
  primary_stream: string;
  secondary_streams: string[];
  pricing_strategy: string;
  estimated_monthly_revenue_range: string;
}

export interface WeekPlan {
  week: number;
  tasks: string[];
  milestone: string;
}

export interface DayZeroPlan {
  lean_canvas: LeanCanvas;
  revenue_model: RevenueModel;
  go_to_market_30_days: WeekPlan[];
}

export interface DiscoveryResult {
  ideas: RankedIdea[];
  goldilocksIdeas: RankedIdea[];
  dataSource?: "mock" | "live";
  totalGenerated?: number;
}

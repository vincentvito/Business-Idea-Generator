export interface LeaderboardIdea {
  id: string;
  title: string;
  oneLiner: string;
  category: string;
  location: string;
  overallScore: number;
  demandScore: number;
  competitionScore: number;
  monetizationScore: number;
  timingScore: number;
  totalVolume: number;
  avgCPC: number;
  avgCompetition: number;
  verdict: "strong" | "promising" | "risky" | "weak";
  validatedAt: string;
  upvotes: number;
  bookmarks: number;
  keyRisks: string[];
  nextSteps: string[];
  keywords: string[];
}

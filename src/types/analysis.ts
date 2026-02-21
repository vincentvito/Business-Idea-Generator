export interface MonthlyTrend {
  month: string;
  volume: number;
}

export interface PivotSuggestion {
  id: string;
  pivotTitle: string;
  pivotOneLiner: string;
  pivotReason: string;
  estimatedScore: number;
  category: string;
}

export interface SuccessStory {
  id: string;
  companyName: string;
  founderName: string;
  ideaOrigin: string;
  category: string;
  location: string;
  yearFounded: number;
  currentRevenue: string;
  employeeCount: number;
  keyInsight: string;
  timeline: { year: number; milestone: string }[];
  logoColor: string;
}

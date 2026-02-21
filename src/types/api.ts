export interface ValidateRequest {
  idea: string;
}

import type { DiscoveryFilters } from "./discovery";

export interface DiscoverGenerateRequest {
  category: string;
  location: string;
  filters?: DiscoveryFilters;
}

export interface DiscoverEnrichRequest {
  idea: {
    id: number;
    title: string;
    one_liner: string;
    pain_point: string;
    target_audience: string;
    suggested_keywords: string[];
  };
  category: string;
  location: string;
  filters?: DiscoveryFilters;
}

export interface KeywordsRequest {
  keywords: string[];
  location?: string;
}

export interface CompetitorsRequest {
  keywords: string[];
  location?: string;
}

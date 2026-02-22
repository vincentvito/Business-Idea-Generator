// ─── DataForSEO API Response Types ───

/** Top-level response envelope from all DataForSEO endpoints */
export interface DataForSEOResponse<T> {
  version: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  tasks_count: number;
  tasks_error: number;
  tasks: DataForSEOTask<T>[];
}

export interface DataForSEOTask<T> {
  id: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  result_count: number;
  path: string[];
  data: unknown;
  result: T[] | null;
}

// ─── Google Ads Search Volume ───

/** Nested keyword_info object (present in some DataForSEO response formats) */
export interface KeywordInfo {
  last_updated_time?: string;
  competition?: number | string | null;
  competition_level?: "LOW" | "MEDIUM" | "HIGH" | null;
  competition_index?: number | null;
  cpc?: number | null;
  search_volume?: number | null;
  low_top_of_page_bid?: number | null;
  high_top_of_page_bid?: number | null;
  categories?: number[] | null;
  monthly_searches?: MonthlySearch[] | null;
}

/**
 * Result item from keywords_data/google_ads/search_volume/live.
 * DataForSEO may return fields flat OR nested under keyword_info
 * depending on API version. We handle both defensively.
 */
export interface SearchVolumeResult {
  keyword: string;
  spell?: string | null;
  location_code?: number;
  language_code?: string;
  search_partners?: boolean;
  // Flat fields (current DataForSEO v3 format)
  competition?: "LOW" | "MEDIUM" | "HIGH" | null;
  competition_index?: number | null;
  cpc?: number | null;
  search_volume?: number | null;
  low_top_of_page_bid?: number | null;
  high_top_of_page_bid?: number | null;
  monthly_searches?: MonthlySearch[] | null;
  // Nested format (some endpoints / older responses)
  keyword_info?: KeywordInfo;
}

export interface MonthlySearch {
  year: number;
  month: number;
  search_volume: number;
}

// ─── Google Trends ───

export interface TrendsExploreResult {
  type: string;
  keywords: string[];
  items: TrendsItem[] | null;
}

export interface TrendsItem {
  keyword: string;
  type: string;
  data: TrendsDataPoint[];
}

export interface TrendsDataPoint {
  date_from: string;
  date_to: string;
  timestamp: number;
  values: number[];
  value?: number; // Some endpoints return a single value
}

// ─── Google Organic SERP ───

export interface SerpOrganicResult {
  keyword: string;
  type: string;
  se_domain: string;
  location_code: number;
  language_code: string;
  check_url: string;
  datetime: string;
  item_types: string[];
  items_count: number;
  items: SerpItem[];
}

export interface SerpItem {
  type: string;
  rank_group: number;
  rank_absolute: number;
  position: string;
  title: string;
  url: string;
  domain: string;
  description: string;
  breadcrumb: string;
  is_image: boolean;
  is_video: boolean;
  is_featured_snippet: boolean;
  is_malicious: boolean;
  links?: { type: string; title: string; url: string }[];
  highlighted?: string[];
}

// ─── Amazon Products ───

export interface AmazonProductsResult {
  keyword: string;
  type: string;
  se_domain: string;
  location_code: number;
  language_code: string;
  check_url: string;
  datetime: string;
  item_types: string[];
  items_count: number;
  items: AmazonItem[];
}

export interface AmazonItem {
  type: string;
  rank_group: number;
  rank_absolute: number;
  position: string;
  asin: string;
  title: string;
  url: string;
  image_url: string | null;
  price: AmazonPrice | null;
  rating: AmazonRating | null;
  is_amazon_choice: boolean;
  is_best_seller: boolean;
  delivery_info: string | null;
  data_asin: string;
  seller_name: string | null;
}

export interface AmazonPrice {
  current: number;
  regular: number | null;
  max_value: number | null;
  currency: string;
  is_price_range: boolean;
  displayed_price: string;
}

export interface AmazonRating {
  type: string;
  value: number | null;
  votes_count: number | null;
  rating_max: number | null;
}

// ─── Amazon Bulk Search Volume ───

export interface AmazonBulkSearchVolumeResult {
  items: AmazonKeywordVolume[];
}

export interface AmazonKeywordVolume {
  keyword: string;
  search_volume: number;
}

// ─── Google Maps SERP ───

export interface GoogleMapsResult {
  keyword: string;
  type: string;
  se_domain: string;
  location_code: number;
  language_code: string;
  check_url: string;
  datetime: string;
  item_types: string[];
  items_count: number;
  items: GoogleMapsItem[];
}

export interface GoogleMapsItem {
  type: string;
  rank_group: number;
  rank_absolute: number;
  domain: string | null;
  title: string;
  url: string | null;
  contact_url: string | null;
  rating: GoogleMapsRating | null;
  address: string | null;
  address_info: {
    borough: string | null;
    address: string | null;
    city: string | null;
    zip: string | null;
    region: string | null;
    country_code: string | null;
  } | null;
  place_id: string | null;
  phone: string | null;
  main_image: string | null;
  category: string | null;
  additional_categories: string[] | null;
  work_hours: Record<string, string[]> | null;
  latitude: number | null;
  longitude: number | null;
  is_claimed: boolean | null;
  cid: string | null;
  price_level: string | null;
}

export interface GoogleMapsRating {
  rating_type: string;
  value: number;
  votes_count: number;
  rating_max: number;
}

// ─── Google My Business Info ───

export interface GoogleBusinessInfoResult {
  keyword: string;
  type: string;
  se_domain: string;
  location_code: number;
  language_code: string;
  check_url: string;
  datetime: string;
  items_count: number;
  items: GoogleBusinessInfoItem[];
}

export interface GoogleBusinessInfoItem {
  type: string;
  title: string;
  description: string | null;
  category: string | null;
  category_ids: string[] | null;
  additional_categories: string[] | null;
  address: string | null;
  address_info: {
    borough: string | null;
    address: string | null;
    city: string | null;
    zip: string | null;
    region: string | null;
    country_code: string | null;
  } | null;
  place_id: string | null;
  phone: string | null;
  url: string | null;
  domain: string | null;
  logo: string | null;
  main_image: string | null;
  total_photos: number | null;
  snippet: string | null;
  latitude: number | null;
  longitude: number | null;
  is_claimed: boolean | null;
  rating: {
    rating_type: string;
    value: number;
    votes_count: number;
    rating_max: number;
    rating_distribution: Record<string, number> | null;
  } | null;
  price_level: string | null;
  cid: string | null;
  attributes: Record<string, string[]> | null;
  popular_times: Record<string, Array<{ time: number; popular_index: number }>> | null;
  people_also_search: Array<{
    title: string;
    cid: string;
    feature_id: string;
    rating: { value: number; votes_count: number } | null;
  }> | null;
}

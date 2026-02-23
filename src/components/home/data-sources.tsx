import {
  Search,
  TrendingUp,
  Globe,
  ShoppingCart,
  Brain,
  Image as ImageIcon,
  Utensils,
  Database,
  Layers,
  Radio,
  BarChart3,
  Activity,
  Users,
  Package,
  Sparkles,
  Palette,
  Clock,
  MapPin,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface DataSource {
  name: string;
  provider: string;
  description: string;
  metric: string;
  metricIcon: LucideIcon;
  icon: LucideIcon;
  color: string;
  accentBg: string;
  comingSoon?: boolean;
}

const dataSources: DataSource[] = [
  {
    name: "Google Ads Keywords",
    provider: "via DataForSEO",
    description:
      "Real search volume, competition index, and CPC data for every keyword we analyze.",
    metric: "50K+ keywords tracked",
    metricIcon: BarChart3,
    icon: Search,
    color: "text-blue-500",
    accentBg: "bg-blue-50",
  },
  {
    name: "Google Trends",
    provider: "via DataForSEO",
    description:
      "12-month trend data and momentum signals to spot rising and declining markets.",
    metric: "12-month trend analysis",
    metricIcon: Activity,
    icon: TrendingUp,
    color: "text-green-500",
    accentBg: "bg-green-50",
  },
  {
    name: "Google SERP Analysis",
    provider: "via DataForSEO",
    description:
      "Top 10 organic search results to map competitors and identify market gaps.",
    metric: "10 competitors per query",
    metricIcon: Users,
    icon: Globe,
    color: "text-orange-500",
    accentBg: "bg-orange-50",
  },
  {
    name: "Amazon Marketplace",
    provider: "via DataForSEO",
    description:
      "Food product data, pricing, ratings, and bestseller signals for packaged food validation.",
    metric: "500K+ products indexed",
    metricIcon: Package,
    icon: ShoppingCart,
    color: "text-yellow-600",
    accentBg: "bg-yellow-50",
  },
  {
    name: "Google Maps Data",
    provider: "via DataForSEO",
    description:
      "Local business density, ratings, and review counts to assess competition in any area.",
    metric: "Location-based insights",
    metricIcon: MapPin,
    icon: MapPin,
    color: "text-red-500",
    accentBg: "bg-red-50",
  },
  {
    name: "Yelp Data",
    provider: "via DataForSEO",
    description:
      "Restaurant ratings, review sentiment, and category trends to validate local food demand.",
    metric: "Review & rating analysis",
    metricIcon: Star,
    icon: Star,
    color: "text-rose-500",
    accentBg: "bg-rose-50",
  },
  {
    name: "Claude AI",
    provider: "Anthropic",
    description:
      "Food industry AI for idea generation, competitive scoring, and deep-dive restaurant analysis.",
    metric: "AI-powered scoring engine",
    metricIcon: Sparkles,
    icon: Brain,
    color: "text-[#1A4A3A]",
    accentBg: "bg-[#E8F0ED]",
  },
  {
    name: "Replicate AI",
    provider: "Recraft V3 + Nano-Banana",
    description:
      "AI-generated moodboards and logo concepts for instant brand visualization.",
    metric: "Visual brand assets",
    metricIcon: Palette,
    icon: ImageIcon,
    color: "text-pink-500",
    accentBg: "bg-pink-50",
  },
  {
    name: "Food Business API",
    provider: "Restaurant & Food Industry",
    description:
      "Restaurant industry data, food trends, and market insights for food business validation.",
    metric: "Integration in progress",
    metricIcon: Clock,
    icon: Utensils,
    color: "text-emerald-500",
    accentBg: "bg-emerald-50",
    comingSoon: true,
  },
];

const aggregateStats = [
  { label: "1M+ data points analyzed", icon: Database },
  { label: "9 data sources", icon: Layers },
  { label: "Real-time market signals", icon: Radio },
];

export function DataSources() {
  return (
    <div>
      <h2 className="text-center text-xl font-bold mb-2">
        Powered by Real Market Data
      </h2>
      <p className="text-center text-sm text-muted-foreground mb-8 max-w-xl mx-auto">
        Every food business idea is validated against multiple authoritative data
        sources — no guesswork, just real numbers.
      </p>

      {/* Aggregate stats pills */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {aggregateStats.map((stat) => (
          <span
            key={stat.label}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0ED] border border-[#B8D1C4] text-[#1A4A3A] px-3.5 py-1.5 text-xs font-medium"
          >
            <stat.icon className="h-3.5 w-3.5" />
            {stat.label}
          </span>
        ))}
      </div>

      {/* Data source cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dataSources.map((source) => (
          <div
            key={source.name}
            className={
              source.comingSoon
                ? "rounded-xl border border-dashed border-muted-foreground/25 bg-muted/50 p-5 relative opacity-75"
                : "rounded-xl border bg-card p-5 transition hover:shadow-md"
            }
          >
            {source.comingSoon && (
              <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                Coming Soon
              </span>
            )}
            <div className="flex items-start gap-3 mb-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${source.accentBg}`}
              >
                <source.icon className={`h-5 w-5 ${source.color}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">{source.name}</p>
                <span className="inline-block mt-0.5 rounded-full border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {source.provider}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {source.description}
            </p>
            <p
              className={`text-xs font-semibold mt-3 flex items-center gap-1 ${
                source.comingSoon
                  ? "text-muted-foreground"
                  : "text-[#1A4A3A]"
              }`}
            >
              <source.metricIcon className="h-3 w-3" />
              {source.metric}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

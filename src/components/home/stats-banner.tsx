import { CheckCircle2, Star, TrendingUp, Compass } from "lucide-react";
import { STATS_DATA } from "@/lib/mock-data";

const stats = [
  { label: "Ideas Validated", value: STATS_DATA.ideasValidated.toLocaleString(), icon: CheckCircle2, color: "text-green-500" },
  { label: "Goldilocks Found", value: STATS_DATA.goldilocksFound.toLocaleString(), icon: Star, color: "text-yellow-500" },
  { label: "Avg Score", value: STATS_DATA.avgScore.toString(), icon: TrendingUp, color: "text-blue-500" },
  { label: "Categories", value: STATS_DATA.categoriesExplored.toString(), icon: Compass, color: "text-purple-500" },
];

export function StatsBanner() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 rounded-lg border bg-card p-3"
        >
          <stat.icon className={`h-5 w-5 shrink-0 ${stat.color}`} />
          <div>
            <p className="text-lg font-bold leading-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

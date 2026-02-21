import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { getCategoryStats } from "@/lib/mock-data";
import { CATEGORY_ICONS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell, UtensilsCrossed, ShoppingCart, Code, GraduationCap,
  Heart, Building2, Wallet, Plane, Sparkles, PawPrint, Wrench,
  Leaf, Film, Baby, Briefcase, Car, Shirt, Wheat, HandHeart,
} from "lucide-react";

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  Dumbbell, UtensilsCrossed, ShoppingCart, Code, GraduationCap,
  Heart, Building2, Wallet, Plane, Sparkles, PawPrint, Wrench,
  Leaf, Film, Baby, Briefcase, Car, Shirt, Wheat, HandHeart,
};

export default function CategoriesPage() {
  const categories = getCategoryStats();

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Browse Categories</h1>
        <p className="text-muted-foreground mt-1">
          Explore business opportunities across {categories.length} categories.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const iconName = CATEGORY_ICONS[cat.category];
          const Icon = iconName ? iconComponents[iconName] : null;

          return (
            <Link
              key={cat.category}
              href={`/discover?category=${encodeURIComponent(cat.category)}`}
              className="group rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {Icon ? <Icon className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                </div>
                <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                  {cat.category}
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold">{cat.totalIdeas}</p>
                  <p className="text-xs text-muted-foreground">Ideas</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{cat.avgScore}</p>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{cat.goldilocksCount}</p>
                  <p className="text-xs text-muted-foreground">Goldilocks</p>
                </div>
              </div>
              <div className="mt-3">
                <Badge variant="outline" className="text-xs">
                  Top: {cat.topNiche}
                </Badge>
              </div>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}

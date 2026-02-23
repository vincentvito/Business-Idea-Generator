"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChefHat,
  Package,
  Star,
  TrendingUp,
  HelpCircle,
  XCircle,
  Percent,
  ShoppingBag,
} from "lucide-react";
import type {
  MenuOrProductData,
  MenuEngineering,
  MenuItem,
  ProductLineup,
  ProductItem,
} from "@/types/deep-dive";

// ── Classification badges ────────────────────────────────

const MENU_CLASSIFICATION: Record<
  MenuItem["classification"],
  { label: string; icon: typeof Star; color: string; bg: string }
> = {
  star: { label: "Star", icon: Star, color: "text-yellow-700", bg: "bg-yellow-100" },
  plowhorse: { label: "Plowhorse", icon: TrendingUp, color: "text-green-700", bg: "bg-green-100" },
  puzzle: { label: "Puzzle", icon: HelpCircle, color: "text-blue-700", bg: "bg-blue-100" },
  dog: { label: "Dog", icon: XCircle, color: "text-red-700", bg: "bg-red-100" },
};

const PRODUCT_CLASSIFICATION: Record<
  ProductItem["classification"],
  { label: string; color: string; bg: string }
> = {
  hero: { label: "Hero", color: "text-yellow-700", bg: "bg-yellow-100" },
  cash_cow: { label: "Cash Cow", color: "text-green-700", bg: "bg-green-100" },
  growth: { label: "Growth", color: "text-blue-700", bg: "bg-blue-100" },
  niche: { label: "Niche", color: "text-[#0D2C24]", bg: "bg-[#E8F0ED]" },
};

function foodCostColor(percent: number): string {
  if (percent <= 28) return "text-green-600";
  if (percent <= 35) return "text-yellow-600";
  return "text-red-600";
}

// ── Main component ───────────────────────────────────────

interface MenuOrProductSectionProps {
  data: MenuOrProductData;
}

export function MenuOrProductSection({ data }: MenuOrProductSectionProps) {
  if (data.type === "menu") {
    return <MenuEngineeringView data={data.data} />;
  }
  return <ProductLineupView data={data.data} />;
}

// ── Menu Engineering View ────────────────────────────────

function MenuEngineeringView({ data }: { data: MenuEngineering }) {
  const [activeTab, setActiveTab] = useState(
    data.menu_categories[0]?.name ?? ""
  );

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <ChefHat className="h-5 w-5 text-orange-500" />
        Menu Engineering
      </h2>

      {/* Food Cost Summary */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Avg Food Cost:</span>
              <span className={`text-sm font-bold ${foodCostColor(data.food_cost_summary.average_food_cost_percent)}`}>
                {data.food_cost_summary.average_food_cost_percent}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Target:</span>
              <span className="text-sm font-bold text-muted-foreground">
                {data.food_cost_summary.target_food_cost_percent}%
              </span>
            </div>
          </div>
          {data.food_cost_summary.recommendations.length > 0 && (
            <ul className="mt-2 space-y-1">
              {data.food_cost_summary.recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-1.5">
                  <span className="shrink-0">&bull;</span>
                  {rec}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Menu Categories Tabs */}
      {data.menu_categories.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1">
            {data.menu_categories.map((cat) => (
              <TabsTrigger key={cat.name} value={cat.name} className="text-xs">
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {data.menu_categories.map((cat) => (
            <TabsContent key={cat.name} value={cat.name}>
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {cat.items.map((item, i) => (
                      <MenuItemRow key={i} item={item} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Pricing Strategy */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Pricing Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{data.pricing_strategy}</p>
        </CardContent>
      </Card>

      {/* Combos & Upsells */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.combo_strategies.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Combo Strategies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.combo_strategies.map((combo, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{combo.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{combo.bundle_price}</span>
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        Save {combo.savings_percent}%
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {combo.items.join(" + ")}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {data.upsell_recommendations.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Upsell Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {data.upsell_recommendations.map((rec, i) => (
                  <li key={i} className="text-sm flex gap-1.5">
                    <span className="text-muted-foreground shrink-0">&bull;</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* BCG Matrix Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { key: "star" as const, summary: data.stars_summary, title: "Stars" },
          { key: "plowhorse" as const, summary: data.plowhorses_summary, title: "Plowhorses" },
          { key: "puzzle" as const, summary: data.puzzles_summary, title: "Puzzles" },
          { key: "dog" as const, summary: data.dogs_summary, title: "Dogs" },
        ].map(({ key, summary, title }) => {
          const config = MENU_CLASSIFICATION[key];
          const Icon = config.icon;
          return (
            <Card key={key}>
              <CardContent className="py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <span className="text-sm font-medium">{title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{summary}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function MenuItemRow({ item }: { item: MenuItem }) {
  const config = MENU_CLASSIFICATION[item.classification];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-sm">{item.name}</span>
          <Badge className={`${config.bg} ${config.color} text-xs`}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{item.description}</p>
      </div>
      <div className="text-right shrink-0 space-y-0.5">
        <div className="font-bold text-sm">{item.price}</div>
        <div className={`text-xs ${foodCostColor(item.food_cost_percent)}`}>
          {item.food_cost_percent}% cost
        </div>
        <div className="text-xs text-green-600">
          {item.profit_margin_percent}% margin
        </div>
      </div>
    </div>
  );
}

// ── Product Lineup View ──────────────────────────────────

function ProductLineupView({ data }: { data: ProductLineup }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Package className="h-5 w-5 text-violet-500" />
        Product Lineup
      </h2>

      {/* Margin Summary */}
      <Card className="border-violet-200 bg-violet-50/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-medium">Avg Margin:</span>
              <span className="text-sm font-bold text-green-600">
                {data.margin_summary.average_margin_percent}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Target:</span>
              <span className="text-sm font-bold text-muted-foreground">
                {data.margin_summary.target_margin_percent}%
              </span>
            </div>
          </div>
          {data.margin_summary.recommendations.length > 0 && (
            <ul className="mt-2 space-y-1">
              {data.margin_summary.recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-1.5">
                  <span className="shrink-0">&bull;</span>
                  {rec}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.products.map((product, i) => (
          <ProductItemCard key={i} product={product} />
        ))}
      </div>

      {/* Pricing Strategy */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Pricing Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{data.pricing_strategy}</p>
        </CardContent>
      </Card>

      {/* Bundles & Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.bundle_strategies.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Bundle Strategies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.bundle_strategies.map((bundle, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{bundle.name}</span>
                    <span className="text-sm font-bold">{bundle.bundle_price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {bundle.products.join(" + ")}
                  </p>
                  <p className="text-xs text-green-600">{bundle.value_proposition}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Distribution Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.distribution_channels.map((channel, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  {channel}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Roadmap */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Product Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{data.product_roadmap}</p>
        </CardContent>
      </Card>
    </section>
  );
}

function ProductItemCard({ product }: { product: ProductItem }) {
  const config = PRODUCT_CLASSIFICATION[product.classification];

  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-sm">{product.name}</span>
          <Badge className={`${config.bg} ${config.color} text-xs`}>
            {config.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-2">{product.description}</p>
        <div className="flex items-center justify-between text-xs">
          <span>
            Price: <span className="font-bold">{product.price}</span>
          </span>
          <span>
            Cost: <span className="text-muted-foreground">{product.cost_to_produce}</span>
          </span>
          <span className="text-green-600 font-bold">
            {product.margin_percent}% margin
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

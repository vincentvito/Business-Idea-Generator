"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { useUser } from "@/hooks/use-user";
import { Check, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Interval = "month" | "year";

const plans = [
  {
    name: "Free",
    tier: "FREE" as const,
    description: "Try it out with limited access",
    price: { month: 0, year: 0 },
    features: [
      { text: "3 idea validations / month", included: true },
      { text: "1 discovery session / month", included: true },
      { text: "View leaderboard & trends", included: true },
      { text: "Local bookmarks", included: true },
      { text: "Day Zero Plans", included: false },
      { text: "PDF export", included: false },
      { text: "Cloud-synced bookmarks", included: false },
      { text: "Bulk validation", included: false },
    ],
  },
  {
    name: "Pro",
    tier: "PRO" as const,
    description: "For serious entrepreneurs",
    price: { month: 19, year: 149 },
    popular: true,
    features: [
      { text: "Unlimited validations", included: true },
      { text: "Unlimited discovery sessions", included: true },
      { text: "View leaderboard & trends", included: true },
      { text: "Cloud-synced bookmarks", included: true },
      { text: "Day Zero Plans", included: true },
      { text: "PDF export", included: true },
      { text: "Priority AI processing", included: true },
      { text: "Bulk validation", included: false },
    ],
  },
  {
    name: "Business",
    tier: "BUSINESS" as const,
    description: "For teams & power users",
    price: { month: 49, year: 399 },
    features: [
      { text: "Unlimited validations", included: true },
      { text: "Unlimited discovery sessions", included: true },
      { text: "View leaderboard & trends", included: true },
      { text: "Cloud-synced bookmarks", included: true },
      { text: "Day Zero Plans", included: true },
      { text: "PDF export", included: true },
      { text: "Priority AI processing", included: true },
      { text: "Bulk validation (10 at once)", included: true },
    ],
  },
];

export default function PricingPage() {
  const [interval, setInterval] = useState<Interval>("month");
  const { tier: currentTier, isAuthenticated } = useUser();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleUpgrade(tier: string) {
    if (!isAuthenticated) {
      router.push("/login?callbackUrl=/pricing");
      return;
    }

    if (tier === "FREE") return;

    setLoadingPlan(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, interval }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // handle error
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <PageContainer>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Start free, upgrade when you need more. Every plan includes real market data powered by AI.
        </p>
      </div>

      {/* Interval toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center rounded-lg border bg-muted p-1">
          <button
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              interval === "month" ? "bg-background shadow-sm" : "text-muted-foreground"
            )}
            onClick={() => setInterval("month")}
          >
            Monthly
          </button>
          <button
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              interval === "year" ? "bg-background shadow-sm" : "text-muted-foreground"
            )}
            onClick={() => setInterval("year")}
          >
            Yearly
            <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0 bg-green-100 text-green-700">
              Save ~35%
            </Badge>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = currentTier === plan.tier;
          const price = plan.price[interval];

          return (
            <Card
              key={plan.name}
              className={cn(
                "relative",
                plan.popular && "border-primary shadow-md"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Zap className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-3">
                  <span className="text-3xl font-bold">${price}</span>
                  {price > 0 && (
                    <span className="text-muted-foreground text-sm">
                      /{interval === "year" ? "year" : "mo"}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      )}
                      <span className={feature.included ? "" : "text-muted-foreground/60"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={isCurrentPlan || loadingPlan !== null}
                  onClick={() => handleUpgrade(plan.tier)}
                >
                  {loadingPlan === plan.tier
                    ? "Redirecting..."
                    : isCurrentPlan
                      ? "Current Plan"
                      : price === 0
                        ? "Get Started"
                        : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}

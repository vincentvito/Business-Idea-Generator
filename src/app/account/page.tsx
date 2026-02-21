"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageContainer } from "@/components/layout/page-container";
import { useUser } from "@/hooks/use-user";
import { useUsage } from "@/hooks/use-usage";
import { UsageMeter } from "@/components/paywall/usage-meter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ExternalLink, User, BarChart3 } from "lucide-react";

const tierColors: Record<string, string> = {
  FREE: "bg-muted text-muted-foreground",
  PRO: "bg-blue-100 text-blue-700",
  BUSINESS: "bg-purple-100 text-purple-700",
};

export default function AccountPage() {
  const { status } = useSession();
  const { user, tier, isAuthenticated } = useUser();
  const { usage } = useUsage();
  const router = useRouter();
  const [isManaging, setIsManaging] = useState(false);

  if (status === "loading") {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </PageContainer>
    );
  }

  if (!isAuthenticated) {
    router.push("/login?callbackUrl=/account");
    return null;
  }

  async function handleManageBilling() {
    setIsManaging(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // handle error
    } finally {
      setIsManaging(false);
    }
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, subscription, and usage.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <Badge variant="secondary" className={tierColors[tier]}>
                {tier}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tier === "FREE" ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  You&apos;re on the free plan. Upgrade for unlimited access.
                </p>
                <Button size="sm" onClick={() => router.push("/pricing")}>
                  View Plans
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Manage your subscription, update payment method, or cancel.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleManageBilling}
                  disabled={isManaging}
                >
                  {isManaging ? "Opening..." : (
                    <>
                      Manage Billing <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Usage This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {usage ? (
              <>
                <UsageMeter
                  used={usage.validate.used}
                  limit={usage.validate.limit}
                  label="Idea Validations"
                />
                <UsageMeter
                  used={usage.discover.used}
                  limit={usage.discover.limit}
                  label="Discovery Sessions"
                />
                <UsageMeter
                  used={usage.enrich.used}
                  limit={usage.enrich.limit}
                  label="Day Zero Plans"
                />
                {tier === "FREE" && (
                  <p className="text-xs text-muted-foreground pt-2">
                    Upgrade to Pro for unlimited usage.
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Loading usage data...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

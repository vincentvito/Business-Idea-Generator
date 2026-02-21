"use client";

import Link from "next/link";
import { Lock, ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UpgradePromptProps {
  feature: string;
  requiredTier?: "PRO" | "BUSINESS";
  type?: "auth_required" | "usage_limit";
}

export function UpgradePrompt({
  feature,
  requiredTier = "PRO",
  type = "usage_limit",
}: UpgradePromptProps) {
  if (type === "auth_required") {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <LogIn className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Sign in required</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a free account to {feature.toLowerCase()}
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/login">
              Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">Upgrade to {requiredTier}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {feature} is available on the {requiredTier} plan
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/pricing">
            View Plans <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

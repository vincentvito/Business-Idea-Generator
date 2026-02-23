"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, User, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { AUTH_BYPASS_ENABLED } from "@/lib/auth/bypass-client";

const tierColors: Record<string, string> = {
  FREE: "bg-muted text-muted-foreground",
  PRO: "bg-blue-100 text-blue-700",
  BUSINESS: "bg-[#E8F0ED] text-[#0D2C24]",
};

export function UserMenu() {
  const { data: session, status } = useSession();

  const isBypassed = AUTH_BYPASS_ENABLED;

  if (!isBypassed && status === "loading") {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
    );
  }

  if (!isBypassed && !session?.user) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">Sign In</Link>
      </Button>
    );
  }

  const tier = isBypassed ? "PRO" : ((session?.user as { tier?: string }).tier ?? "FREE");
  const initial = isBypassed ? "D" : (session?.user?.email?.[0] ?? "U").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {initial}
          </span>
          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${tierColors[tier]}`}>
            {tier}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm">
          <p className="font-medium truncate">{isBypassed ? "dev@localhost" : session?.user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/pricing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {tier === "FREE" ? "Upgrade" : "Billing"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

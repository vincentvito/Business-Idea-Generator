"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, ChevronDown, Bookmark, Menu, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UserMenu } from "./user-menu";

const NAV_LINKS = [
  { href: "/validate", label: "Validate" },
  { href: "/discover", label: "Discover" },
  { href: "/pricing", label: "Pricing" },
];

const EXPLORE_LINKS = [
  { href: "/top", label: "Top Ideas", description: "Highest-scoring validated ideas" },
  { href: "/trending", label: "Trending", description: "Rising niches & search trends" },
  { href: "/categories", label: "Categories", description: "Browse by business category" },
  { href: "/success-stories", label: "Success Stories", description: "Ideas that became businesses" },
];

const ALL_LINKS = [...NAV_LINKS, ...EXPLORE_LINKS, { href: "/bookmarks", label: "Bookmarks" }];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Zap className="h-5 w-5 text-primary" />
          <span>Market-Fit Engine</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="ml-8 hidden md:flex items-center gap-1">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent flex items-center gap-1",
                  EXPLORE_LINKS.some((l) => pathname === l.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                Explore <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {EXPLORE_LINKS.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="flex flex-col items-start gap-0.5">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/bookmarks"
            className={cn(
              "hidden md:flex rounded-md p-1.5 transition-colors hover:bg-accent",
              pathname === "/bookmarks" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
            title="Saved ideas"
          >
            <Bookmark className="h-4 w-4" />
          </Link>

          <div className="hidden md:flex">
            <UserMenu />
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1">
                {ALL_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

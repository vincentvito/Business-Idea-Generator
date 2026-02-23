"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Globe } from "lucide-react";
import type { BrandNameSuggestion } from "@/types/deep-dive";

const STYLE_COLORS: Record<string, string> = {
  playful: "bg-pink-100 text-pink-700",
  professional: "bg-blue-100 text-blue-700",
  modern: "bg-[#E8F0ED] text-[#0D2C24]",
  classic: "bg-amber-100 text-amber-700",
  techy: "bg-cyan-100 text-cyan-700",
};

interface BrandNamesSectionProps {
  names: BrandNameSuggestion[];
}

export function BrandNamesSection({ names }: BrandNamesSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-yellow-500" />
        Potential Brand Names
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {names.map((name, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{name.name}</CardTitle>
                <Badge className={STYLE_COLORS[name.style] ?? "bg-gray-100 text-gray-700"}>
                  {name.style}
                </Badge>
              </div>
              <p className="text-sm italic text-muted-foreground">&ldquo;{name.tagline}&rdquo;</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{name.reasoning}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                {name.domain_suggestion}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

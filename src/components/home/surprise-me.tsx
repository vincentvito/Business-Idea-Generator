"use client";

import { useState } from "react";
import { getIdeasPool } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreGauge } from "@/components/validate/score-gauge";
import { Shuffle, ArrowRight } from "lucide-react";
import Link from "next/link";

const pool = getIdeasPool();

interface SurpriseMeProps {
  variant?: "default" | "hero" | "inline";
}

export function SurpriseMe({ variant = "default" }: SurpriseMeProps) {
  const [idea, setIdea] = useState<typeof pool[number] | null>(null);
  const isHero = variant === "hero";
  const isInline = variant === "inline";

  const handleSurprise = () => {
    const random = pool[Math.floor(Math.random() * pool.length)];
    setIdea(random);
  };

  return (
    <div className={isInline ? "" : "mt-6 text-center"}>
      {isInline ? (
        <Button onClick={handleSurprise} variant="outline" size="default" className="gap-2">
          <Shuffle className="h-4 w-4" />
          Surprise Me
        </Button>
      ) : isHero ? (
        <Button
          onClick={handleSurprise}
          variant="ghost"
          size="lg"
          className="gap-2 text-white/70 hover:text-white hover:bg-white/10"
        >
          <Shuffle className="h-4 w-4" />
          or try a random idea
        </Button>
      ) : (
        <Button onClick={handleSurprise} variant="outline" size="lg" className="gap-2">
          <Shuffle className="h-4 w-4" />
          Surprise Me with a Random Idea
        </Button>
      )}

      {idea && (
        <div
          className={`mt-4 rounded-xl p-5 text-left max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300 ${
            isHero
              ? "border border-white/20 bg-white/10 backdrop-blur-sm text-white"
              : "rounded-lg border bg-card"
          }`}
        >
          <h3 className="font-bold mb-1">{idea.title}</h3>
          <p className={`text-sm mb-3 ${isHero ? "text-white/70" : "text-muted-foreground"}`}>
            {idea.oneLiner}
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge
              variant="outline"
              className={isHero ? "border-white/30 text-white/70" : ""}
            >
              {idea.category}
            </Badge>
            <Badge
              variant="secondary"
              className={isHero ? "bg-white/10 text-white/70 border-0" : ""}
            >
              {idea.location}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <ScoreGauge label="Score" score={idea.overallScore} size="sm" />
            <ScoreGauge label="Demand" score={idea.demandScore} size="sm" />
            <ScoreGauge label="Competition" score={idea.competitionScore} size="sm" />
          </div>

          <div className="flex gap-2">
            <Button
              asChild
              size="sm"
              variant="outline"
              className={isHero ? "border-white/30 text-white hover:bg-white/10" : ""}
            >
              <Link href="/validate">
                Validate <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
            <Button
              onClick={handleSurprise}
              size="sm"
              variant="ghost"
              className={isHero ? "text-white/70 hover:text-white hover:bg-white/10" : ""}
            >
              <Shuffle className="mr-1 h-3 w-3" /> Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { getIdeasPool } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreGauge } from "@/components/validate/score-gauge";
import { Shuffle, ArrowRight } from "lucide-react";
import Link from "next/link";

const pool = getIdeasPool();

export function SurpriseMe() {
  const [idea, setIdea] = useState<typeof pool[number] | null>(null);

  const handleSurprise = () => {
    const random = pool[Math.floor(Math.random() * pool.length)];
    setIdea(random);
  };

  return (
    <div className="my-8 text-center">
      <Button onClick={handleSurprise} variant="outline" size="lg" className="gap-2">
        <Shuffle className="h-4 w-4" />
        Surprise Me with a Random Idea
      </Button>

      {idea && (
        <div className="mt-4 rounded-lg border bg-card p-5 text-left max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="font-bold mb-1">{idea.title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{idea.oneLiner}</p>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline">{idea.category}</Badge>
            <Badge variant="secondary">{idea.location}</Badge>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <ScoreGauge label="Score" score={idea.overallScore} size="sm" />
            <ScoreGauge label="Demand" score={idea.demandScore} size="sm" />
            <ScoreGauge label="Competition" score={idea.competitionScore} size="sm" />
          </div>

          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/validate">
                Validate <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
            <Button onClick={handleSurprise} size="sm" variant="ghost">
              <Shuffle className="mr-1 h-3 w-3" /> Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

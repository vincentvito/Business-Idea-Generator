import Link from "next/link";
import { getIdeaOfTheDay } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreGauge } from "@/components/validate/score-gauge";
import { Flame, ArrowRight } from "lucide-react";

export function IdeaOfTheDay() {
  const idea = getIdeaOfTheDay();

  return (
    <div className="my-8 rounded-lg border-2 border-primary/20 bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="h-5 w-5 text-orange-500" />
        <h2 className="font-semibold">Idea of the Day</h2>
      </div>

      <h3 className="text-lg font-bold mb-1">{idea.title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{idea.oneLiner}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline">{idea.category}</Badge>
        <Badge variant="secondary">{idea.location}</Badge>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <ScoreGauge label="Overall" score={idea.overallScore} size="sm" />
        <ScoreGauge label="Demand" score={idea.demandScore} size="sm" />
        <ScoreGauge label="Competition" score={idea.competitionScore} size="sm" />
        <ScoreGauge label="Monetization" score={idea.monetizationScore} size="sm" />
      </div>

      <Button asChild size="sm" variant="outline">
        <Link href="/validate">
          Validate this idea <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
}

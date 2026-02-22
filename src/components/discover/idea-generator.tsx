"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/shared/bookmark-button";
import { ShareButton } from "@/components/shared/share-button";
import { Star, ChevronDown, ChevronUp, ArrowRight, Lock } from "lucide-react";
import type { RankedIdea } from "@/types/discovery";

interface IdeaGeneratorProps {
  ideas: RankedIdea[];
  onSelectIdea: (idea: RankedIdea) => void;
  selectedIdeaId: number | null;
  onGeneratePlan: () => void;
  isGeneratingPlan: boolean;
  userTier?: string;
  dataSource?: "mock" | "live";
  totalGenerated?: number;
}

export function IdeaGenerator({
  ideas,
  onSelectIdea,
  selectedIdeaId,
  onGeneratePlan,
  isGeneratingPlan,
  userTier = "FREE",
  dataSource,
  totalGenerated,
}: IdeaGeneratorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">
            {ideas.length} Ideas Found
          </h3>
          {dataSource && (
            <Badge
              variant="outline"
              className={
                dataSource === "live"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-orange-50 text-orange-700 border-orange-200"
              }
            >
              {dataSource === "live" ? "Live data" : "Estimated data"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span>= Goldilocks opportunity</span>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
              <th className="p-3 font-medium w-8">#</th>
              <th className="p-3 font-medium">Idea</th>
              <th className="p-3 font-medium text-right">Volume</th>
              <th className="p-3 font-medium text-right">Comp.</th>
              <th className="p-3 font-medium text-right">CPC</th>
              <th className="p-3 font-medium text-right">Score</th>
              <th className="p-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {ideas.map((idea, index) => {
              const isSelected = selectedIdeaId === idea.id;
              return (
                <React.Fragment key={idea.id}>
                  <tr
                    className={`border-b cursor-pointer transition-colors hover:bg-muted/30 ${
                      isSelected ? "bg-primary/5 border-b-0" : ""
                    } ${idea.isGoldilocks ? "bg-yellow-50" : ""}`}
                    onClick={() => onSelectIdea(idea)}
                  >
                    <td className="p-3 text-muted-foreground">{index + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {idea.isGoldilocks && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium">{idea.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {idea.one_liner}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {idea.totalVolume.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <Badge
                        variant="secondary"
                        className={
                          idea.avgCompetition < 33
                            ? "bg-green-100 text-green-700"
                            : idea.avgCompetition < 66
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }
                      >
                        {idea.avgCompetition}
                      </Badge>
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      ${idea.avgCPC.toFixed(2)}
                    </td>
                    <td className="p-3 text-right tabular-nums font-medium">
                      {idea.score}
                    </td>
                    <td className="p-3">
                      {isSelected ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </td>
                  </tr>
                  {isSelected && (
                    <tr className="border-b bg-primary/5">
                      <td colSpan={7} className="p-4">
                        <IdeaDetail
                          idea={idea}
                          onGeneratePlan={onGeneratePlan}
                          isGeneratingPlan={isGeneratingPlan}
                          userTier={userTier}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface IdeaDetailProps {
  idea: RankedIdea;
  onGeneratePlan: () => void;
  isGeneratingPlan: boolean;
  userTier?: string;
}

export function IdeaDetail({ idea, onGeneratePlan, isGeneratingPlan, userTier = "FREE" }: IdeaDetailProps) {
  const canGeneratePlan = userTier !== "FREE";
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold flex items-center gap-2">
            {idea.title}
            {idea.isGoldilocks && (
              <Badge className="bg-yellow-100 text-yellow-700">Goldilocks</Badge>
            )}
          </h4>
          <p className="text-muted-foreground mt-0.5">{idea.one_liner}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <BookmarkButton
            ideaId={`discover_${idea.id}`}
            ideaTitle={idea.title}
            score={idea.score}
            category="Discovery"
          />
          <ShareButton
            idea={{
              title: idea.title,
              oneLiner: idea.one_liner,
              overallScore: idea.score,
              category: "Discovery",
              verdict: idea.isGoldilocks ? "strong" : "promising",
            }}
          />
        </div>
      </div>
      <div>
        <p className="font-medium mb-1">Pain Point</p>
        <p className="text-muted-foreground">{idea.pain_point}</p>
      </div>
      <div>
        <p className="font-medium mb-1">Target Audience</p>
        <p className="text-muted-foreground">{idea.target_audience}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {idea.suggested_keywords.map((kw) => (
          <Badge key={kw} variant="outline">
            {kw}
          </Badge>
        ))}
      </div>
      {canGeneratePlan ? (
        <Button onClick={onGeneratePlan} disabled={isGeneratingPlan} className="mt-2">
          {isGeneratingPlan ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Generating Plan...
            </>
          ) : (
            <>
              Generate Day Zero Plan <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      ) : (
        <Button variant="outline" className="mt-2" asChild>
          <a href="/pricing">
            <Lock className="mr-2 h-4 w-4" />
            Upgrade to Pro to unlock Day Zero Plans
          </a>
        </Button>
      )}
    </div>
  );
}

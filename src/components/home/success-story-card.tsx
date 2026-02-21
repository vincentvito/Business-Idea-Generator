import type { SuccessStory } from "@/types/analysis";
import { Badge } from "@/components/ui/badge";

export function SuccessStoryCard({ story }: { story: SuccessStory }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: story.logoColor }}
        >
          {story.companyName[0]}
        </div>
        <div>
          <p className="font-semibold text-sm">{story.companyName}</p>
          <p className="text-xs text-muted-foreground">by {story.founderName}</p>
        </div>
        <Badge variant="secondary" className="ml-auto text-xs">
          {story.currentRevenue}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-2">&ldquo;{story.keyInsight}&rdquo;</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="text-xs">{story.category}</Badge>
        <span>{story.location}</span>
      </div>
    </div>
  );
}

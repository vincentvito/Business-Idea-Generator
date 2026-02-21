import { PageContainer } from "@/components/layout/page-container";
import { SuccessStoryCard } from "@/components/home/success-story-card";
import { getSuccessStories } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export default function SuccessStoriesPage() {
  const stories = getSuccessStories();

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Success Stories</h1>
        <p className="text-muted-foreground mt-1">
          Real-world inspiration from ideas that became businesses.
        </p>
      </div>

      <div className="space-y-6">
        {stories.map((story) => (
          <div key={story.id} className="rounded-lg border bg-card p-6">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-white font-bold text-xl shrink-0"
                style={{ backgroundColor: story.logoColor }}
              >
                {story.companyName[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold">{story.companyName}</h2>
                  <Badge variant="secondary">{story.currentRevenue}</Badge>
                  <Badge variant="outline">{story.employeeCount} employees</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Founded by {story.founderName} in {story.yearFounded} &middot; {story.location}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Original Idea</p>
              <p className="text-sm text-muted-foreground">{story.ideaOrigin}</p>
            </div>

            <div className="mb-4 rounded-md bg-muted/50 p-3">
              <p className="text-sm italic">&ldquo;{story.keyInsight}&rdquo;</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Timeline</p>
              <div className="space-y-2">
                {story.timeline.map((t, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="font-mono text-muted-foreground shrink-0 w-10">
                      {t.year}
                    </span>
                    <span>{t.milestone}</span>
                  </div>
                ))}
              </div>
            </div>

            <Badge variant="outline" className="mt-4 text-xs">
              {story.category}
            </Badge>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

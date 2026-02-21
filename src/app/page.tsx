import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Lightbulb, ArrowRight } from "lucide-react";
import { StatsBanner } from "@/components/home/stats-banner";
import { LiveFeed } from "@/components/home/live-feed";
import { HowItWorks } from "@/components/home/how-it-works";
import { IdeaOfTheDay } from "@/components/home/idea-of-the-day";
import { TrustSignals } from "@/components/home/trust-signals";
import { SurpriseMe } from "@/components/home/surprise-me";
import { NewsletterSignup } from "@/components/home/newsletter-signup";
import { SuccessStoryCard } from "@/components/home/success-story-card";
import { getSuccessStories } from "@/lib/mock-data";

export default function HomePage() {
  const stories = getSuccessStories().slice(0, 3);

  return (
    <PageContainer>
      {/* Hero */}
      <div className="flex flex-col items-center text-center py-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Stop guessing.
          <br />
          <span className="text-muted-foreground">Start validating.</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Market-Fit Engine uses real Google search data and AI reasoning to
          quantify demand, map competitors, and discover underserved niches.
        </p>
      </div>

      {/* Stats Banner */}
      <StatsBanner />

      {/* Live Feed */}
      <LiveFeed />

      {/* Main Tools */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-2">
              <Search className="h-5 w-5" />
            </div>
            <CardTitle>60-Second Reality Check</CardTitle>
            <CardDescription>
              Enter a business idea and get instant validation with real search
              volume, competitor analysis, and a data-driven score.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/validate">
                Validate an Idea <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-2">
              <Lightbulb className="h-5 w-5" />
            </div>
            <CardTitle>Idea Generator</CardTitle>
            <CardDescription>
              Pick a category and location. We generate 50 ideas, check their
              search volume, and highlight the golden opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/discover">
                Discover Opportunities <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Surprise Me */}
      <SurpriseMe />

      {/* How It Works */}
      <HowItWorks />

      {/* Idea of the Day */}
      <IdeaOfTheDay />

      {/* Success Stories Teaser */}
      <div className="my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Success Stories</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/success-stories">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {stories.map((story) => (
            <SuccessStoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>

      {/* Trust Signals */}
      <TrustSignals />

      {/* Newsletter */}
      <NewsletterSignup />
    </PageContainer>
  );
}

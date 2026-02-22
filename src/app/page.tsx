import Link from "next/link";
import { SectionBand } from "@/components/layout/section-band";
import { Button } from "@/components/ui/button";
import { Search, Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import { StatsBanner } from "@/components/home/stats-banner";
import { LiveFeed } from "@/components/home/live-feed";
import { HowItWorks } from "@/components/home/how-it-works";
import { IdeaOfTheDay } from "@/components/home/idea-of-the-day";
import { TrustSignals } from "@/components/home/trust-signals";
import { DataSources } from "@/components/home/data-sources";
import { SurpriseMe } from "@/components/home/surprise-me";
import { NewsletterSignup } from "@/components/home/newsletter-signup";
import { SuccessStoryCard } from "@/components/home/success-story-card";
import { CustomerReviews } from "@/components/home/customer-reviews";
import { getSuccessStories } from "@/lib/mock-data";

export default function HomePage() {
  const stories = getSuccessStories().slice(0, 3);

  return (
    <main>
      {/* Band 1: Idea Generator Hero (purple gradient) */}
      <SectionBand
        className="bg-gradient-to-b from-purple-600 via-purple-700 to-purple-900 text-white"
        innerClassName="pt-16 pb-12 sm:pt-20 sm:pb-16"
      >
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span>AI-powered food business discovery</span>
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Find Your Next
            <br />
            <span className="text-yellow-300">Food Business Idea</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-purple-100 sm:text-xl">
            Pick a food category and location. Our AI generates 50 food &
            beverage ideas, validates them with real market data, and highlights
            the golden opportunities.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="h-12 px-8 text-base bg-white text-purple-700 hover:bg-purple-50 font-semibold shadow-lg"
          >
            <Link href="/discover">
              <Lightbulb className="mr-2 h-5 w-5" />
              Generate Food Business Ideas
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        <SurpriseMe variant="hero" />
        <LiveFeed variant="hero" />
      </SectionBand>

      {/* Band 2: Stats + Validate CTA (white) */}
      <SectionBand innerClassName="py-10">
        <StatsBanner />

        <div className="mt-8 rounded-xl border-2 border-purple-100 bg-purple-50/50 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Already have a food business idea?</h2>
                <p className="text-muted-foreground mt-1">
                  Get a 60-second reality check with real search volume,
                  competitor analysis, and a data-driven score.
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0 sm:self-center">
              <Link href="/validate">
                Validate an Idea <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </SectionBand>

      {/* Band 3: How It Works (gray) */}
      <SectionBand className="bg-muted" innerClassName="py-12">
        <HowItWorks />
      </SectionBand>

      {/* Band 4: Data Sources / Powered By (white) */}
      <SectionBand innerClassName="py-12">
        <DataSources />
      </SectionBand>

      {/* Band 5: Idea of the Day (gray) */}
      <SectionBand className="bg-muted" innerClassName="py-12">
        <IdeaOfTheDay />
      </SectionBand>

      {/* Band 6: Customer Reviews (white) */}
      <SectionBand innerClassName="py-12">
        <CustomerReviews />
      </SectionBand>

      {/* Band 7: Trust/Proof + Success Stories (gray) */}
      <SectionBand className="bg-muted" innerClassName="py-12">
        <div>
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
        <TrustSignals />
      </SectionBand>

      {/* Band 8: Newsletter (white) */}
      <SectionBand innerClassName="py-12">
        <NewsletterSignup />
      </SectionBand>
    </main>
  );
}

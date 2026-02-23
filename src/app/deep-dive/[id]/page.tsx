"use client";

import { use } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { useDeepDive } from "@/hooks/use-deep-dive";
import { DeepDiveLoading } from "@/components/deep-dive/loading";
import { DeepDiveError } from "@/components/deep-dive/error";
import { BusinessPlanSection } from "@/components/deep-dive/business-plan-section";
import { BrandNamesSection } from "@/components/deep-dive/brand-names-section";
import { MenuOrProductSection } from "@/components/deep-dive/menu-section";
import { MarketingPlanSection } from "@/components/deep-dive/marketing-plan-section";
import { DevilsAdvocateSection } from "@/components/deep-dive/devils-advocate-section";
import { ValidationRoadmapSection } from "@/components/deep-dive/validation-roadmap-section";
import { MoodboardSection } from "@/components/deep-dive/moodboard-section";
import { DeepDivePDFButton } from "@/components/deep-dive/pdf-button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DeepDivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, error } = useDeepDive(id);

  if (isLoading && !data) {
    return (
      <PageContainer>
        <DeepDiveLoading />
      </PageContainer>
    );
  }

  if (error && !data) {
    return (
      <PageContainer>
        <DeepDiveError message={error} />
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer>
        <DeepDiveError message="Deep dive not found" />
      </PageContainer>
    );
  }

  if (data.status === "FAILED") {
    return (
      <PageContainer>
        <DeepDiveError message={data.errorMessage} />
      </PageContainer>
    );
  }

  const isGenerating = data.status === "PENDING" || data.status === "GENERATING";
  const isImagesPending = data.status === "IMAGES_PENDING";
  const hasTextContent = !!data.businessPlan;

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/discover"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to ideas
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{data.ideaTitle}</h1>
              <Badge variant="outline" className="bg-[#E8F0ED] text-[#0D2C24] border-[#B8D1C4]">
                Deep Dive
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {data.category} &middot; {data.location}
            </p>
          </div>
          {hasTextContent && <DeepDivePDFButton deepDiveId={data.id} />}
        </div>
      </div>

      {/* Loading state for generation */}
      {isGenerating && <DeepDiveLoading stage={data.status} />}

      {/* Content sections */}
      {hasTextContent && (
        <div className="space-y-10">
          {data.businessPlan && (
            <BusinessPlanSection data={data.businessPlan} />
          )}
          {data.brandNames && (
            <BrandNamesSection names={data.brandNames} />
          )}
          {data.menuOrProduct && (
            <MenuOrProductSection data={data.menuOrProduct} />
          )}
          {data.marketingPlan && (
            <MarketingPlanSection
              data={data.marketingPlan}
              deepDiveId={data.id}
            />
          )}
          {data.devilsAdvocate && (
            <DevilsAdvocateSection data={data.devilsAdvocate} />
          )}
          {data.validationRoadmap && (
            <ValidationRoadmapSection
              data={data.validationRoadmap}
              deepDiveId={data.id}
            />
          )}
          <MoodboardSection
            data={data.moodboard}
            isLoading={isImagesPending}
          />
        </div>
      )}
    </PageContainer>
  );
}

"use client";

import { Loader2, Brain, Palette, FileText } from "lucide-react";

const STAGES = [
  {
    status: "PENDING",
    icon: FileText,
    label: "Preparing your deep dive...",
    description: "Setting things up",
  },
  {
    status: "GENERATING",
    icon: Brain,
    label: "Generating deep dive content...",
    description:
      "Our AI is building your business plan, brand names, menu design, marketing plan, risk analysis, and validation roadmap",
  },
  {
    status: "IMAGES_PENDING",
    icon: Palette,
    label: "Creating moodboard & logo...",
    description: "AI is generating visual brand assets for your idea",
  },
] as const;

interface DeepDiveLoadingProps {
  stage?: string;
}

export function DeepDiveLoading({ stage = "GENERATING" }: DeepDiveLoadingProps) {
  const current = STAGES.find((s) => s.status === stage) ?? STAGES[1];
  const Icon = current.icon;

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F0ED]">
          <Icon className="h-8 w-8 text-[#1A4A3A]" />
        </div>
        <Loader2 className="absolute -right-1 -top-1 h-5 w-5 animate-spin text-[#E85D2A]" />
      </div>
      <h2 className="text-xl font-semibold">{current.label}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {current.description}
      </p>
      <div className="mt-6 flex gap-2">
        {STAGES.map((s) => {
          const isPast =
            STAGES.findIndex((x) => x.status === stage) >
            STAGES.findIndex((x) => x.status === s.status);
          const isCurrent = s.status === stage;
          return (
            <div
              key={s.status}
              className={`h-2 w-12 rounded-full transition-colors ${
                isPast
                  ? "bg-[#145C42]"
                  : isCurrent
                    ? "bg-[#1A7A52] animate-pulse"
                    : "bg-gray-200"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

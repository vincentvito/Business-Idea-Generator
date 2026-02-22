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
      "Our AI is building your business plan, brand names, risk analysis, and validation roadmap",
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
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100">
          <Icon className="h-8 w-8 text-purple-600" />
        </div>
        <Loader2 className="absolute -right-1 -top-1 h-5 w-5 animate-spin text-purple-500" />
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
                  ? "bg-purple-500"
                  : isCurrent
                    ? "bg-purple-400 animate-pulse"
                    : "bg-gray-200"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

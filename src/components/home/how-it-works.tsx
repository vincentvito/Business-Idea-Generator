import { Compass, Sparkles, Target } from "lucide-react";

const steps = [
  {
    icon: Compass,
    title: "Pick a Food Category",
    description: "Choose from 12 food & beverage categories and set your target location.",
    step: 1,
  },
  {
    icon: Sparkles,
    title: "AI Generates 10 Ideas",
    description: "Our engine researches real search data and creates data-backed food business opportunities.",
    step: 2,
  },
  {
    icon: Target,
    title: "Find Golden Opportunities",
    description: "Ideas ranked by demand, competition, and monetization potential.",
    step: 3,
  },
];

export function HowItWorks() {
  return (
    <div>
      <h2 className="text-center text-lg font-semibold mb-6">How It Works</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div key={step.step} className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
              {step.step}
            </div>
            <div className="mb-2 flex items-center justify-center gap-2">
              <step.icon className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">{step.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

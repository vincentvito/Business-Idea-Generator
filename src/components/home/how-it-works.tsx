import { Lightbulb, BarChart3, Target } from "lucide-react";

const steps = [
  {
    icon: Lightbulb,
    title: "Describe Your Idea",
    description: "Enter your business concept in plain language — no jargon needed.",
    step: 1,
  },
  {
    icon: BarChart3,
    title: "We Analyze the Market",
    description: "Real search volume, competitor landscape, and monetization signals.",
    step: 2,
  },
  {
    icon: Target,
    title: "Get Your Score",
    description: "A data-driven score with risks, opportunities, and next steps.",
    step: 3,
  },
];

export function HowItWorks() {
  return (
    <div className="my-12">
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

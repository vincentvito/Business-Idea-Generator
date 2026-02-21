import { Database, Brain, Shield, Zap } from "lucide-react";
import { TRUST_SIGNALS } from "@/lib/mock-data";

const iconMap = { Database, Brain, Shield, Zap } as Record<string, React.ComponentType<{ className?: string }>>;

export function TrustSignals() {
  return (
    <div className="my-12">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TRUST_SIGNALS.map((signal) => {
          const Icon = iconMap[signal.icon];
          return (
            <div
              key={signal.title}
              className="rounded-lg border p-3 text-center"
            >
              {Icon && <Icon className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />}
              <p className="text-sm font-medium">{signal.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{signal.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

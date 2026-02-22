import { cn } from "@/lib/utils";

interface SectionBandProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}

export function SectionBand({ children, className, innerClassName }: SectionBandProps) {
  return (
    <section className={cn("w-full", className)}>
      <div className={cn("mx-auto max-w-5xl px-4", innerClassName)}>
        {children}
      </div>
    </section>
  );
}

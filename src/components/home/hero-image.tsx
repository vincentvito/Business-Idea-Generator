import Image from "next/image";
import {
  Lightbulb,
  FileText,
  Palette,
  UtensilsCrossed,
  Type,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Sticker {
  icon: LucideIcon;
  label: string;
  rotation: string;
  position: string;
  delay: string;
  color: string;
}

const stickers: Sticker[] = [
  {
    icon: Lightbulb,
    label: "Business Idea",
    rotation: "-3deg",
    position: "top-4 -left-6",
    delay: "0ms",
    color: "text-yellow-500",
  },
  {
    icon: FileText,
    label: "Business Plan",
    rotation: "4deg",
    position: "top-12 -right-8",
    delay: "100ms",
    color: "text-purple-500",
  },
  {
    icon: Palette,
    label: "Mood Board",
    rotation: "-5deg",
    position: "bottom-24 -left-8",
    delay: "200ms",
    color: "text-pink-500",
  },
  {
    icon: UtensilsCrossed,
    label: "Menu Engineering",
    rotation: "3deg",
    position: "bottom-10 -right-6",
    delay: "300ms",
    color: "text-emerald-500",
  },
  {
    icon: Type,
    label: "Name & Logo",
    rotation: "-2deg",
    position: "-bottom-3 left-1/3",
    delay: "400ms",
    color: "text-blue-500",
  },
];

export function HeroImage() {
  return (
    <div className="relative mx-auto max-w-md">
      <div className="aspect-[4/3] rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
        <Image
          src="/hero-food-business.png"
          alt="Food business launch kit — plated dish, mood board, business plan, and brand logo"
          width={896}
          height={672}
          className="h-full w-full object-cover"
          priority
        />
      </div>

      {/* Floating sticker tags */}
      {stickers.map((sticker) => (
        <div
          key={sticker.label}
          className={`absolute ${sticker.position} animate-in fade-in slide-in-from-bottom-2 duration-500`}
          style={{
            transform: `rotate(${sticker.rotation})`,
            animationDelay: sticker.delay,
            animationFillMode: "both",
          }}
        >
          <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-lg text-sm font-medium text-gray-800 whitespace-nowrap">
            <sticker.icon className={`h-3.5 w-3.5 ${sticker.color}`} />
            <span>{sticker.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

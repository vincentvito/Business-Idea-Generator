"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Loader2 } from "lucide-react";
import type { MoodboardData } from "@/types/deep-dive";

interface MoodboardSectionProps {
  data: MoodboardData | null;
  isLoading?: boolean;
}

export function MoodboardSection({ data, isLoading }: MoodboardSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Palette className="h-5 w-5 text-pink-500" />
        Moodboard & Logo
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </h2>

      {isLoading && !data && (
        <Card>
          <CardContent className="py-8">
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Generating brand visuals...
            </p>
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Logo */}
          {data.logo_url && (
            <Card className="md:row-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Logo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center rounded-lg bg-white border p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.logo_url}
                    alt="Generated logo"
                    className="max-w-full max-h-64 object-contain"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Moodboard Images */}
          {data.images.length > 0 && (
            <Card className={data.logo_url ? "md:col-span-2" : "md:col-span-3"}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Brand Moodboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {data.images.map((url, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Moodboard image ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Color Palette */}
          {data.color_palette.length > 0 && (
            <Card className="md:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Color Palette</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {data.color_palette.map((color, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className="h-12 w-12 rounded-lg border"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-muted-foreground font-mono">
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {data.images.length === 0 && !data.logo_url && (
            <Card className="md:col-span-3">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Moodboard images could not be generated. The rest of your deep dive is complete.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}

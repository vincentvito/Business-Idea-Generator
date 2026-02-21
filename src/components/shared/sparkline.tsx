"use client";

import { memo, useMemo } from "react";

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export const Sparkline = memo(function Sparkline({
  data,
  color = "hsl(var(--chart-1))",
  width = 80,
  height = 24,
}: SparklineProps) {
  const points = useMemo(() => {
    if (data.length < 2) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;
    const plotH = height - padding * 2;
    const stepX = (width - padding * 2) / (data.length - 1);

    return data
      .map((v, i) => {
        const x = padding + i * stepX;
        const y = padding + plotH - ((v - min) / range) * plotH;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [data, width, height]);

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

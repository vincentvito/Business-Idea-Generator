"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

interface RevenueCalculatorProps {
  defaultVolume?: number;
}

export function RevenueCalculator({ defaultVolume = 10000 }: RevenueCalculatorProps) {
  const [volume, setVolume] = useState(defaultVolume);
  const [capturePercent, setCapturePercent] = useState(2);
  const [conversionRate, setConversionRate] = useState(5);
  const [avgRevenue, setAvgRevenue] = useState(50);

  const monthlyVisitors = Math.round(volume * (capturePercent / 100));
  const monthlyCustomers = Math.round(monthlyVisitors * (conversionRate / 100));
  const monthlyRevenue = monthlyCustomers * avgRevenue;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-4 w-4 text-muted-foreground" />
        <h4 className="font-medium text-sm">Revenue Calculator</h4>
      </div>

      <div className="space-y-4">
        <SliderRow
          label="Monthly Searches"
          value={volume}
          min={100}
          max={100000}
          step={100}
          onChange={setVolume}
          format={(v) => v.toLocaleString()}
        />
        <SliderRow
          label="Market Capture"
          value={capturePercent}
          min={0.1}
          max={15}
          step={0.1}
          onChange={setCapturePercent}
          format={(v) => `${v.toFixed(1)}%`}
        />
        <SliderRow
          label="Conversion Rate"
          value={conversionRate}
          min={1}
          max={20}
          step={0.5}
          onChange={setConversionRate}
          format={(v) => `${v.toFixed(1)}%`}
        />
        <SliderRow
          label="Avg Revenue / Customer"
          value={avgRevenue}
          min={5}
          max={500}
          step={5}
          onChange={setAvgRevenue}
          format={(v) => `$${v}`}
        />
      </div>

      <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-lg font-bold">{monthlyVisitors.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Monthly Visitors</p>
        </div>
        <div>
          <p className="text-lg font-bold">{monthlyCustomers.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Customers / mo</p>
        </div>
        <div>
          <p className="text-lg font-bold text-green-600">
            ${monthlyRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Revenue / mo</p>
        </div>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
      />
    </div>
  );
}

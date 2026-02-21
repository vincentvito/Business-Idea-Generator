"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CATEGORIES,
  BUDGET_RANGES,
  BUSINESS_MODELS,
  TIME_COMMITMENTS,
  REVENUE_GOALS,
  TARGET_MARKETS,
  TEAM_SIZES,
  DELIVERY_MODELS,
  TIME_TO_REVENUE,
} from "@/lib/constants";
import { ChevronDown, Loader2, Sparkles } from "lucide-react";
import type { DiscoveryFilters } from "@/types/discovery";

interface CategorySelectorProps {
  onSubmit: (category: string, location: string, filters: DiscoveryFilters) => void;
  isRunning: boolean;
  onCancel: () => void;
}

const selectClass =
  "mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  disabled: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={selectClass}
      >
        <option value="">Any</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CategorySelector({ onSubmit, isRunning, onCancel }: CategorySelectorProps) {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [budget, setBudget] = useState("");
  const [businessModel, setBusinessModel] = useState("");
  const [founderSkills, setFounderSkills] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("");
  const [revenueGoal, setRevenueGoal] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [deliveryModel, setDeliveryModel] = useState("");
  const [timeToRevenue, setTimeToRevenue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category && location.trim()) {
      const filters: DiscoveryFilters = {};
      if (budget) filters.budget = budget;
      if (businessModel) filters.businessModel = businessModel;
      if (founderSkills.trim()) filters.founderSkills = founderSkills.trim();
      if (timeCommitment) filters.timeCommitment = timeCommitment;
      if (revenueGoal) filters.revenueGoal = revenueGoal;
      if (targetMarket) filters.targetMarket = targetMarket;
      if (teamSize) filters.teamSize = teamSize;
      if (deliveryModel) filters.deliveryModel = deliveryModel;
      if (timeToRevenue) filters.timeToRevenue = timeToRevenue;
      onSubmit(category, location.trim(), filters);
    }
  };

  const activeFilterCount = [
    budget,
    businessModel,
    founderSkills.trim(),
    timeCommitment,
    revenueGoal,
    targetMarket,
    teamSize,
    deliveryModel,
    timeToRevenue,
  ].filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="text-sm font-medium text-muted-foreground">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isRunning}
            className={selectClass}
          >
            <option value="">Select a category...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="location" className="text-sm font-medium text-muted-foreground">
            Location
          </label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Milan, Italy"
            disabled={isRunning}
            className="mt-1.5"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown
          className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
        />
        Advanced Filters
        {activeFilterCount > 0 && (
          <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
            {activeFilterCount}
          </span>
        )}
      </button>

      {showFilters && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 rounded-lg border border-border p-4">
          <FilterSelect
            id="budget"
            label="Investment Budget"
            value={budget}
            onChange={setBudget}
            options={BUDGET_RANGES}
            disabled={isRunning}
          />
          <FilterSelect
            id="businessModel"
            label="Business Model"
            value={businessModel}
            onChange={setBusinessModel}
            options={BUSINESS_MODELS}
            disabled={isRunning}
          />
          <div>
            <label htmlFor="founderSkills" className="text-sm font-medium text-muted-foreground">
              Founder Skills
            </label>
            <Input
              id="founderSkills"
              value={founderSkills}
              onChange={(e) => setFounderSkills(e.target.value)}
              placeholder="e.g., developer, marketer, designer"
              disabled={isRunning}
              className="mt-1.5"
            />
          </div>
          <FilterSelect
            id="timeCommitment"
            label="Time Commitment"
            value={timeCommitment}
            onChange={setTimeCommitment}
            options={TIME_COMMITMENTS}
            disabled={isRunning}
          />
          <FilterSelect
            id="revenueGoal"
            label="Revenue Goal"
            value={revenueGoal}
            onChange={setRevenueGoal}
            options={REVENUE_GOALS}
            disabled={isRunning}
          />
          <FilterSelect
            id="targetMarket"
            label="Target Market"
            value={targetMarket}
            onChange={setTargetMarket}
            options={TARGET_MARKETS}
            disabled={isRunning}
          />
          <FilterSelect
            id="teamSize"
            label="Team Size"
            value={teamSize}
            onChange={setTeamSize}
            options={TEAM_SIZES}
            disabled={isRunning}
          />
          <FilterSelect
            id="deliveryModel"
            label="Delivery Model"
            value={deliveryModel}
            onChange={setDeliveryModel}
            options={DELIVERY_MODELS}
            disabled={isRunning}
          />
          <FilterSelect
            id="timeToRevenue"
            label="Time to Revenue"
            value={timeToRevenue}
            onChange={setTimeToRevenue}
            options={TIME_TO_REVENUE}
            disabled={isRunning}
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={!category || !location.trim() || isRunning}
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Ideas
            </>
          )}
        </Button>
        {isRunning && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  POPULAR_CATEGORIES,
  CATEGORY_ICONS,
  BUDGET_RANGES,
  BUSINESS_MODELS,
  TIME_COMMITMENTS,
  REVENUE_GOALS,
  TARGET_MARKETS,
  TEAM_SIZES,
  DELIVERY_MODELS,
  TIME_TO_FIRST_SALE,
  CUISINE_SPECIALTIES,
  isLocationOptional,
} from "@/lib/constants";
import {
  ChevronDown,
  Loader2,
  Sparkles,
  UtensilsCrossed,
  Truck,
  CakeSlice,
  ChefHat,
  Coffee,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DiscoveryFilters } from "@/types/discovery";

interface CategorySelectorProps {
  onSubmit: (category: string, location: string, filters: DiscoveryFilters) => void;
  isRunning: boolean;
  onCancel: () => void;
}

const selectClass =
  "mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const iconComponents: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Truck,
  CakeSlice,
  ChefHat,
  Coffee,
};

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
  const [cuisineSpecialty, setCuisineSpecialty] = useState("");

  const locationOptional = isLocationOptional(category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category && (locationOptional || location.trim())) {
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
      if (cuisineSpecialty) filters.cuisineSpecialty = cuisineSpecialty;
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
    cuisineSpecialty,
  ].filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category selection with tabs */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
          Food Business Type
        </label>
        <Tabs defaultValue="popular">
          <TabsList className="mb-3">
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="all">All Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="popular">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {POPULAR_CATEGORIES.map((cat) => {
                const iconName = CATEGORY_ICONS[cat.name];
                const Icon = iconName ? iconComponents[iconName] : null;
                const isSelected = category === cat.name;

                return (
                  <button
                    key={cat.name}
                    type="button"
                    disabled={isRunning}
                    onClick={() => setCategory(cat.name)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all hover:border-primary/50",
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border bg-card",
                      isRunning && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                    </div>
                    <span className="text-xs font-medium leading-tight">
                      {cat.name.split(" & ")[0]}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">
                      {cat.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="all">
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isRunning}
              className={selectClass}
            >
              <option value="">Select a food business type...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </TabsContent>
        </Tabs>

        {category && (
          <p className="mt-2 text-xs text-muted-foreground">
            Selected: <span className="font-medium text-foreground">{category}</span>
          </p>
        )}
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="text-sm font-medium text-muted-foreground">
          Location{locationOptional ? " (optional)" : ""}
        </label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={locationOptional ? "e.g., Milan, Italy (or leave empty for global)" : "e.g., Milan, Italy"}
          disabled={isRunning}
          className="mt-1.5"
        />
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
              placeholder="e.g., chef, baker, food marketing, operations"
              disabled={isRunning}
              className="mt-1.5"
            />
          </div>
          <FilterSelect
            id="cuisineSpecialty"
            label="Cuisine / Specialty"
            value={cuisineSpecialty}
            onChange={setCuisineSpecialty}
            options={CUISINE_SPECIALTIES}
            disabled={isRunning}
          />
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
            label="Kitchen & Staff"
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
            label="Time to First Sale"
            value={timeToRevenue}
            onChange={setTimeToRevenue}
            options={TIME_TO_FIRST_SALE}
            disabled={isRunning}
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={!category || (!locationOptional && !location.trim()) || isRunning}
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

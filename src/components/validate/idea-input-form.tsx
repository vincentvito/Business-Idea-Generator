"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";

interface IdeaInputFormProps {
  onSubmit: (idea: string) => void;
  isRunning: boolean;
  onCancel: () => void;
}

export function IdeaInputForm({ onSubmit, isRunning, onCancel }: IdeaInputFormProps) {
  const [idea, setIdea] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim().length >= 10) {
      onSubmit(idea.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="idea" className="text-sm font-medium text-muted-foreground">
          Describe your business idea
        </label>
        <textarea
          id="idea"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder='e.g., "I want to open a high-end sourdough bakery in Dubai with subscription-based delivery"'
          className="mt-1.5 flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          disabled={isRunning}
          maxLength={1000}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {idea.length}/1000 characters (minimum 10)
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={idea.trim().length < 10 || isRunning}
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Validate Idea <ArrowRight className="ml-2 h-4 w-4" />
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

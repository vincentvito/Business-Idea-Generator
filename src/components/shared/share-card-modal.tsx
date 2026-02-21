"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreGauge } from "@/components/validate/score-gauge";
import { Copy, Check, Zap } from "lucide-react";

interface ShareCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: {
    title: string;
    oneLiner: string;
    overallScore: number;
    category: string;
    verdict: string;
  };
}

export function ShareCardModal({ open, onOpenChange, idea }: ShareCardModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share This Idea</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline">{idea.category}</Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              Market-Fit Engine
            </div>
          </div>

          <h3 className="text-lg font-bold">{idea.title}</h3>
          <p className="text-sm text-muted-foreground">{idea.oneLiner}</p>

          <div className="flex items-center gap-4">
            <ScoreGauge label="Score" score={idea.overallScore} size="sm" />
            <Badge
              className={`text-xs ${
                idea.verdict === "strong"
                  ? "bg-green-100 text-green-800"
                  : idea.verdict === "promising"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-orange-100 text-orange-800"
              }`}
            >
              {idea.verdict}
            </Badge>
          </div>
        </div>

        <Button onClick={handleCopy} variant="outline" className="w-full gap-2">
          {copied ? (
            <>
              <Check className="h-4 w-4" /> Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> Copy Link
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

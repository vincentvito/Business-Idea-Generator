"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareCardModal } from "./share-card-modal";

interface ShareButtonProps {
  idea: {
    title: string;
    oneLiner: string;
    overallScore: number;
    category: string;
    verdict: string;
  };
}

export function ShareButton({ idea }: ShareButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        title="Share this idea"
      >
        <Share2 className="h-4 w-4" />
      </Button>
      <ShareCardModal open={open} onOpenChange={setOpen} idea={idea} />
    </>
  );
}

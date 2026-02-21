"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";

interface PDFDownloadButtonProps {
  type: "validation" | "plan";
  data: unknown;
  label?: string;
}

export function PDFDownloadButton({ type, data, label }: PDFDownloadButtonProps) {
  const { tier } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  if (tier === "FREE") return null;

  async function handleDownload() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      });

      if (!res.ok) return;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `market-fit-${type}-report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} disabled={isLoading}>
      <Download className="h-4 w-4 mr-2" />
      {isLoading ? "Generating..." : (label ?? "Download PDF")}
    </Button>
  );
}

"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeepDiveErrorProps {
  message?: string | null;
}

export function DeepDiveError({ message }: DeepDiveErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
        <AlertTriangle className="h-7 w-7 text-red-600" />
      </div>
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {message ?? "An error occurred while generating your deep dive. Please try again."}
      </p>
      <Button
        variant="outline"
        className="mt-6"
        onClick={() => window.location.reload()}
      >
        Try Again
      </Button>
    </div>
  );
}

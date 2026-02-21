"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle2 } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const existing = JSON.parse(localStorage.getItem("mfe-newsletter") ?? "[]");
      existing.push({ email, subscribedAt: new Date().toISOString() });
      localStorage.setItem("mfe-newsletter", JSON.stringify(existing));
    } catch {
      // ignore
    }
    setSubmitted(true);
  };

  return (
    <div className="my-12 rounded-lg border bg-card p-6 text-center">
      {submitted ? (
        <div className="flex flex-col items-center gap-2 py-2">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
          <p className="font-medium">You&apos;re subscribed!</p>
          <p className="text-sm text-muted-foreground">
            We&apos;ll send you the best business ideas weekly.
          </p>
        </div>
      ) : (
        <>
          <Mail className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
          <h3 className="font-semibold">Get the Top Ideas Weekly</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Join 2,400+ entrepreneurs. Free, no spam, unsubscribe anytime.
          </p>
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm gap-2">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit">Subscribe</Button>
          </form>
        </>
      )}
    </div>
  );
}

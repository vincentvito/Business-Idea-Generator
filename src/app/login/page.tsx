"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto flex min-h-[calc(100vh-3.5rem)] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const isVerify = searchParams.get("verify") === "true";
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    await signIn("resend", { email, callbackUrl });
    setIsLoading(false);
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        {isVerify ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Check your email</CardTitle>
              <CardDescription>
                We sent you a magic link. Click it to sign in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">
                Didn&apos;t receive it? Check your spam folder or{" "}
                <button
                  onClick={() => window.history.back()}
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  try again
                </button>
                .
              </p>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Sign in to FoodLaunch</CardTitle>
              <CardDescription>
                Enter your email to receive a magic link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Sending link...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Continue with Email
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                No password needed. We&apos;ll email you a secure link.
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </main>
  );
}

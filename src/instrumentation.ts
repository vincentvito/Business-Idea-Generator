export async function register() {
  if (typeof window !== "undefined") return;

  const key = process.env.ANTHROPIC_API_KEY?.trim();

  if (key) {
    console.log(
      `[startup] ANTHROPIC_API_KEY loaded (${key.substring(0, 12)}...${key.substring(key.length - 4)}, ${key.length} chars)`
    );
  } else {
    console.warn(
      "[startup] WARNING: ANTHROPIC_API_KEY is NOT set in process.env. " +
        "AI features will fail. Check .env.local and restart with: rm -rf .next && npm run dev"
    );
  }

  const envStatus = {
    ANTHROPIC_API_KEY: key ? "set" : "MISSING",
    DATAFORSEO_LOGIN: process.env.DATAFORSEO_LOGIN ? "set" : "missing",
    BYPASS_AUTH: process.env.BYPASS_AUTH ?? "not set",
    NODE_ENV: process.env.NODE_ENV,
  };

  console.log("[startup] Environment status:", JSON.stringify(envStatus));
}

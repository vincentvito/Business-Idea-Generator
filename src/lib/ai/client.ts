import Anthropic from "@anthropic-ai/sdk";
import { loadEnvConfig } from "@next/env";

let client: Anthropic | null = null;
let envLoaded = false;

/**
 * Force-load env files using Next.js's own loader when
 * Turbopack hasn't populated process.env yet.
 */
function ensureEnvLoaded(): void {
  if (envLoaded) return;
  envLoaded = true;

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("[AI] ANTHROPIC_API_KEY not in process.env, forcing @next/env load...");
    const { loadedEnvFiles } = loadEnvConfig(process.cwd());
    console.log("[AI] Loaded env files:", loadedEnvFiles?.map((f) => f.path));
    console.log("[AI] ANTHROPIC_API_KEY now present:", !!process.env.ANTHROPIC_API_KEY);
  }
}

function resolveApiKey(): string {
  ensureEnvLoaded();

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is missing. Set it in your environment variables (Vercel dashboard or .env.local for local dev)."
    );
  }

  if (!apiKey.startsWith("sk-ant-")) {
    console.warn(
      "[AI] WARNING: ANTHROPIC_API_KEY does not start with 'sk-ant-'. It may be invalid."
    );
  }

  return apiKey;
}

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = resolveApiKey();
    console.log(
      `[AI] Anthropic client initialized (key: ${apiKey.substring(0, 12)}...${apiKey.substring(apiKey.length - 4)})`
    );
    client = new Anthropic({ apiKey });
  }
  return client;
}

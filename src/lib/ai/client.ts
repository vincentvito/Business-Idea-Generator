import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";

let client: Anthropic | null = null;

/**
 * Fallback: read ANTHROPIC_API_KEY directly from .env.local when
 * Next.js / Turbopack has not populated process.env (stale cache, etc.).
 */
function loadEnvFallback(): string | undefined {
  try {
    const envPath = join(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    if (match) {
      const value = match[1].trim();
      process.env.ANTHROPIC_API_KEY = value;
      console.log("[AI] Loaded ANTHROPIC_API_KEY from .env.local fallback");
      return value;
    }
  } catch {
    // .env.local does not exist or is unreadable
  }
  return undefined;
}

function resolveApiKey(): string {
  let apiKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (!apiKey) {
    apiKey = loadEnvFallback();
  }

  if (!apiKey) {
    const envPath = join(process.cwd(), ".env.local");
    throw new Error(
      "ANTHROPIC_API_KEY is missing. Checked process.env and " +
        envPath +
        ". Ensure the key is set in .env.local and restart: rm -rf .next && npm run dev"
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

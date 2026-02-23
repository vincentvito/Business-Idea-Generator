import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  const envKey = process.env.ANTHROPIC_API_KEY?.trim();
  let fallbackAvailable = false;

  if (!envKey) {
    try {
      const envPath = join(process.cwd(), ".env.local");
      const content = readFileSync(envPath, "utf-8");
      fallbackAvailable = /^ANTHROPIC_API_KEY=.+$/m.test(content);
    } catch {
      // .env.local not readable
    }
  }

  const keyPresent = !!envKey;
  const keyFormat = envKey
    ? envKey.startsWith("sk-ant-")
      ? "valid_prefix"
      : "unexpected_prefix"
    : "missing";
  const keyPreview = envKey
    ? `${envKey.substring(0, 12)}...${envKey.substring(envKey.length - 4)}`
    : null;

  const status = keyPresent ? "ok" : fallbackAvailable ? "degraded" : "error";

  return Response.json(
    {
      status,
      key: {
        present: keyPresent,
        format: keyFormat,
        preview: keyPreview,
      },
      fallback: {
        env_local_has_key: !keyPresent ? fallbackAvailable : undefined,
      },
      env: {
        node_env: process.env.NODE_ENV,
        cwd: process.cwd(),
      },
      timestamp: new Date().toISOString(),
    },
    { status: status === "error" ? 503 : 200 }
  );
}

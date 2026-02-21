interface Bucket {
  tokens: number;
  lastRefill: number;
}

const LIMITS: Record<string, { maxTokens: number; windowMs: number }> = {
  validate: { maxTokens: 20, windowMs: 3600_000 },
  discover: { maxTokens: 10, windowMs: 3600_000 },
  keywords: { maxTokens: 50, windowMs: 3600_000 },
  competitors: { maxTokens: 50, windowMs: 3600_000 },
};

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  action: string,
  clientId: string
): { allowed: boolean; retryAfter: number } {
  const limit = LIMITS[action];
  if (!limit) return { allowed: true, retryAfter: 0 };

  const key = `${action}:${clientId}`;
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: limit.maxTokens, lastRefill: now };
    buckets.set(key, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  const refillRate = limit.maxTokens / limit.windowMs;
  bucket.tokens = Math.min(limit.maxTokens, bucket.tokens + elapsed * refillRate);
  bucket.lastRefill = now;

  if (bucket.tokens < 1) {
    const waitMs = (1 - bucket.tokens) / refillRate;
    return { allowed: false, retryAfter: Math.ceil(waitMs / 1000) };
  }

  bucket.tokens -= 1;
  return { allowed: true, retryAfter: 0 };
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

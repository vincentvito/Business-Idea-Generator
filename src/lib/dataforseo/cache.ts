interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_ENTRIES = 5_000;

const cache = new Map<string, CacheEntry<unknown>>();
let hits = 0;
let misses = 0;

function makeKey(prefix: string, id: string, location?: string): string {
  return `${prefix}:${id.toLowerCase()}:${location?.toLowerCase() ?? "global"}`;
}

export function getCached<T>(prefix: string, id: string, location?: string): T | null {
  const key = makeKey(prefix, id, location);
  const entry = cache.get(key);

  if (!entry) {
    misses++;
    return null;
  }

  if (Date.now() - entry.timestamp > TTL) {
    cache.delete(key);
    misses++;
    return null;
  }

  hits++;
  return entry.data as T;
}

export function setCache<T>(prefix: string, id: string, location: string | undefined, data: T): void {
  if (cache.size >= MAX_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }

  cache.set(makeKey(prefix, id, location), {
    data,
    timestamp: Date.now(),
  });
}

export function getCacheStats(): { size: number; hits: number; misses: number } {
  return { size: cache.size, hits, misses };
}

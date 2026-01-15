import Dexie, { Table } from "dexie";

/**
 * Cached API response structure
 */
export interface CachedResponse {
  id?: number;
  key: string;
  data: unknown;
  timestamp: number;
  etag?: string;
}

/**
 * Dexie database for IndexedDB persistence
 * Persists cache across browser sessions
 */
class PackageCacheDatabase extends Dexie {
  cachedResponses!: Table<CachedResponse>;

  constructor() {
    super("PrePackageCache");
    this.version(1).stores({
      cachedResponses: "key, timestamp",
    });
  }
}

export const db = new PackageCacheDatabase();

/**
 * Storage utilities for cache operations
 */
export const storage = {
  /**
   * Get cached response by key
   */
  async get(key: string): Promise<CachedResponse | undefined> {
    return await db.cachedResponses.where("key").equals(key).first();
  },

  /**
   * Set cached response
   */
  async set(key: string, data: unknown, etag?: string): Promise<void> {
    await db.cachedResponses.put({
      key,
      data,
      timestamp: Date.now(),
      etag,
    });
  },

  /**
   * Check if cache is stale
   * @param cachedItem Cached item to check
   * @param maxAge Maximum age in milliseconds (default: 24 hours)
   */
  isStale(
    cachedItem: CachedResponse,
    maxAge: number = 24 * 60 * 60 * 1000,
  ): boolean {
    const age = Date.now() - cachedItem.timestamp;
    return age > maxAge;
  },

  /**
   * Clear all cached responses
   */
  async clear(): Promise<void> {
    await db.cachedResponses.clear();
  },

  /**
   * Clear expired cache entries
   */
  async clearExpired(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const cutoff = Date.now() - maxAge;
    await db.cachedResponses.where("timestamp").below(cutoff).delete();
  },
};

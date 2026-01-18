import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

/**
 * localStorage persister for React Query cache
 * Stores package data across page reloads to minimize API calls
 *
 * Note: Using localStorage (5MB limit) which is sufficient for package metadata.
 */
export const localStoragePersister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => Promise.resolve(localStorage.getItem(key)),
    setItem: (key, value) => {
      localStorage.setItem(key, value);
      return Promise.resolve();
    },
    removeItem: (key) => {
      localStorage.removeItem(key);
      return Promise.resolve();
    },
  },
  key: "PICKAGE_QUERY_CACHE",
  // Throttle writes to avoid performance issues
  throttleTime: 1000,
});

/**
 * React Query configuration with aggressive caching
 * Implements stale-while-revalidate pattern
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time: 7 days (keep data in cache)
      gcTime: 7 * 24 * 60 * 60 * 1000,

      // Stale time: 72 hours (consider data fresh)
      staleTime: 72 * 60 * 60 * 1000,

      // Retry failed requests once
      retry: 1,

      // Refetch on window focus (disabled to save API calls)
      refetchOnWindowFocus: false,

      // Refetch on reconnect (enabled with deduplication)
      refetchOnReconnect: true,

      // Refetch on mount (if stale)
      refetchOnMount: true,

      // De-duplicate concurrent requests
      networkMode: "always",
    },
  },
});

/**
 * Cache key utilities
 */
export const cacheKeys = {
  package: (name: string, ecosystem: string = "npm") =>
    ["package", ecosystem, name] as const,

  packages: (names: string[], ecosystem: string = "npm") =>
    ["packages", ecosystem, names.sort()] as const,

  githubRepo: (repoUrl: string) => ["github", "repo", repoUrl] as const,

  githubReadme: (repoUrl: string) => ["github", "readme", repoUrl] as const,

  searchSuggestions: (query: string) =>
    ["search", "suggestions", query] as const,

  pypiPopularPackages: () => ["pypi", "popular-packages"] as const,

  pypiFullPackages: () => ["pypi", "full-packages"] as const,
};

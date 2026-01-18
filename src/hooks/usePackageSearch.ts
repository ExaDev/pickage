import { useQuery } from "@tanstack/react-query";
import { NpmsClient } from "@/adapters/npm/npms-client";
import { PyPiClient } from "@/adapters/pypi/pypi-client";
import { cacheKeys } from "@/utils/cache";
import { usePyPiPackages } from "./usePyPiPackages";

const npmsClient = new NpmsClient();
const pypiClient = new PyPiClient();

export interface SearchResultPackage {
  name: string;
  description: string | null;
  ecosystem: "npm" | "pypi";
}

export interface SearchResult {
  package: SearchResultPackage;
}

export interface UsePackageSearchOptions {
  enabled?: boolean;
}

/**
 * Hook for searching packages across multiple ecosystems (npm and PyPI)
 * with debouncing and caching
 *
 * @param query - Search query string
 * @param options - Configuration options
 * @returns Query result with search suggestions from both npm and PyPI
 *
 * @example
 * const { data, isLoading } = usePackageSearch('react');
 * // data contains array of packages from both npm and pypi
 */
export function usePackageSearch(
  query: string,
  options: UsePackageSearchOptions = {},
) {
  const { enabled = true } = options;

  // Get PyPI packages from React Query cache (prefers full, falls back to popular)
  const { data: pypiPackages } = usePyPiPackages();

  return useQuery({
    queryKey: cacheKeys.searchSuggestions(query),
    queryFn: async () => {
      try {
        // Search npm and PyPI in parallel
        const [npmResults] = await Promise.allSettled([
          npmsClient.fetchSuggestions(query),
        ]);

        // Search PyPI packages client-side (synchronous)
        let pypiResults: ReturnType<typeof pypiClient.searchPackages> = [];
        if (pypiPackages) {
          pypiResults = pypiClient.searchPackages(pypiPackages, query);
        }

        const results: SearchResult[] = [];

        // Add npm results
        if (npmResults.status === "fulfilled") {
          results.push(
            ...npmResults.value.map((result) => ({
              package: {
                name: result.package.name,
                description: result.package.description,
                ecosystem: "npm" as const,
              },
            })),
          );
        }

        // Add PyPI results (no longer a Promise.allSettled result)
        if (pypiResults.length > 0) {
          results.push(
            ...pypiResults.map((pkg) => ({
              package: {
                name: pkg.name,
                description: pkg.summary ?? null,
                ecosystem: "pypi" as const,
              },
            })),
          );
        }

        // Sort by name and deduplicate while preserving ecosystem info
        const deduplicatedResults = Array.from(
          results
            .reduce((map, result) => {
              const key = result.package.name.toLowerCase();
              if (!map.has(key)) {
                map.set(key, result);
              }
              return map;
            }, new Map<string, SearchResult>())
            .values(),
        ).sort((a, b) => a.package.name.localeCompare(b.package.name));

        return deduplicatedResults;
      } catch (error) {
        console.error("Search error:", error);
        return [];
      }
    },
    enabled: enabled && query.length >= 2,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 6 * 60 * 60 * 1000, // 6 hours
    retry: 1,
  });
}

import { useQuery } from "@tanstack/react-query";
import { NpmsClient } from "@/adapters/npm/npms-client";
import { PyPiClient } from "@/adapters/pypi/pypi-client";
import { cacheKeys } from "@/utils/cache";

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

  return useQuery({
    queryKey: cacheKeys.searchSuggestions(query),
    queryFn: async () => {
      try {
        // Search both npm and PyPI in parallel
        const [npmResults, pypiResults] = await Promise.allSettled([
          npmsClient.fetchSuggestions(query),
          pypiClient.searchPackages(query),
        ]);

        const results: SearchResult[] = [];

        // Add npm results
        if (npmResults.status === "fulfilled" && npmResults.value) {
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

        // Add PyPI results
        if (pypiResults.status === "fulfilled" && pypiResults.value) {
          results.push(
            ...pypiResults.value.map((pkg) => ({
              package: {
                name: pkg.name,
                description: pkg.summary,
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

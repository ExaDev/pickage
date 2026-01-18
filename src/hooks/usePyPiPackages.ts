import { useQuery } from "@tanstack/react-query";
import { pypiPackagesClient } from "../adapters/pypi/pypi-packages-client";
import { cacheKeys } from "../utils/cache";

/**
 * Fetch the full PyPI packages dataset (726k packages, 35MB)
 * This is the preferred dataset but may be slow to load
 */
export function usePyPiFullPackages() {
  return useQuery({
    queryKey: cacheKeys.pypiFullPackages(),
    queryFn: () => pypiPackagesClient.fetchFullPackages(),
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days (full dataset changes less frequently)
    gcTime: 30 * 24 * 60 * 60 * 1000, // 30 days
    retry: 2,
  });
}

/**
 * Fetch the popular PyPI packages dataset (15k packages, 790KB)
 * This is a fallback if the full dataset fails to load
 */
export function usePyPiPopularPackages() {
  return useQuery({
    queryKey: cacheKeys.pypiPopularPackages(),
    queryFn: () => pypiPackagesClient.fetchPopularPackages(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/**
 * Get the best available PyPI packages dataset
 * Prefers full dataset, falls back to popular if full fails
 */
export function usePyPiPackages() {
  const fullQuery = usePyPiFullPackages();
  const popularQuery = usePyPiPopularPackages();

  // Use full dataset if available and not errored
  if (fullQuery.data && !fullQuery.isError) {
    return {
      data: fullQuery.data,
      isFullDataset: true,
      isLoading: fullQuery.isLoading,
      isError: false,
    };
  }

  // Fall back to popular dataset
  return {
    data: popularQuery.data,
    isFullDataset: false,
    isLoading: popularQuery.isLoading,
    isError: popularQuery.isError && fullQuery.isError,
  };
}

/**
 * Search PyPI packages by query
 * Returns null if neither dataset has loaded yet
 */
export function usePyPiPackageSearch(query: string) {
  const { data: fullPackages } = usePyPiFullPackages();
  const { data: popularPackages } = usePyPiPopularPackages();

  if (!query.trim()) {
    return {
      results: [],
      isLoading: false,
      dataset: null as "full" | "popular" | null,
    };
  }

  // Prefer full dataset if available
  if (fullPackages && fullPackages.length > 0) {
    const results = pypiPackagesClient.searchPackages(fullPackages, query);
    return { results, isLoading: false, dataset: "full" as const };
  }

  // Fall back to popular dataset
  if (popularPackages && popularPackages.length > 0) {
    const results = pypiPackagesClient.searchPackages(popularPackages, query);
    return {
      results,
      isLoading: !fullPackages && !popularPackages,
      dataset: "popular" as const,
    };
  }

  // Still loading both
  return { results: [], isLoading: true, dataset: null };
}

/**
 * Prefetch both PyPI datasets in the background
 * Full dataset is preferred but popular is fetched as fallback
 * Call this early (e.g., on app mount) to load datasets before users search
 */
export async function prefetchPyPiPackages() {
  const { queryClient } = await import("../utils/cache");

  // Prefetch both datasets in parallel
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: cacheKeys.pypiFullPackages(),
      queryFn: () => pypiPackagesClient.fetchFullPackages(),
      staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    }),
    queryClient.prefetchQuery({
      queryKey: cacheKeys.pypiPopularPackages(),
      queryFn: () => pypiPackagesClient.fetchPopularPackages(),
      staleTime: 24 * 60 * 60 * 1000, // 24 hours
    }),
  ]);
}

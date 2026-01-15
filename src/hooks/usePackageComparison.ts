import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { NpmAdapter } from "@/adapters/npm";
import type { PeekPackageRequest, PackageStats } from "@/types/adapter";
import { cacheKeys } from "@/utils/cache";

const adapter = new NpmAdapter();

// 72 hours in milliseconds
const STALE_TIME = 72 * 60 * 60 * 1000;
const GC_TIME = 7 * 24 * 60 * 60 * 1000;

/**
 * Hook for fetching package data with caching
 */
export function usePackage(packageName: string, enabled: boolean = true) {
  return useQueries({
    queries: [
      {
        queryKey: cacheKeys.package(packageName),
        queryFn: async () => {
          const request: PeekPackageRequest = {
            packageName,
            ecosystem: "npm",
          };
          return adapter.fetch(request);
        },
        enabled: enabled && !!packageName,
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
      },
    ],
  })[0];
}

/**
 * Hook for comparing multiple packages
 */
export function usePackageComparison(packageNames: string[]) {
  const queryClient = useQueryClient();

  const results = useQueries({
    queries: packageNames.map((name) => ({
      queryKey: cacheKeys.package(name),
      queryFn: async () => {
        const request: PeekPackageRequest = {
          packageName: name,
          ecosystem: "npm",
        };
        return adapter.fetch(request);
      },
      enabled: !!name,
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
      retry: 1, // Only retry once to avoid long waits on API failures
    })),
  });

  const packages: PackageStats[] = results
    .map((result) => result.data)
    .filter((pkg): pkg is PackageStats => pkg !== undefined);

  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);
  const errors = results
    .map((result) => result.error)
    .filter((err): err is Error => err != null);

  // Track which packages failed to load (not found or error)
  const failedPackages: string[] = results
    .map((result, index) => ({
      name: packageNames[index],
      failed: result.isError && !result.isLoading,
    }))
    .filter((item) => item.failed)
    .map((item) => item.name);

  // Track which packages are currently refetching
  const refetchingPackages: Record<string, boolean> = {};
  results.forEach((result, index) => {
    refetchingPackages[packageNames[index]] =
      result.isFetching && !result.isLoading;
  });

  // Refetch a specific package
  const refetchPackage = useCallback(
    async (packageName: string) => {
      await queryClient.invalidateQueries({
        queryKey: cacheKeys.package(packageName),
      });
    },
    [queryClient],
  );

  return {
    isLoading,
    isError,
    errors,
    packages,
    failedPackages,
    refetchingPackages,
    refetchPackage,
  };
}

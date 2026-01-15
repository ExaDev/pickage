import { useQueries } from '@tanstack/react-query';
import { NpmAdapter } from '@/adapters/npm';
import type { PkgCompareRequest, PackageStats } from '@/types/adapter';
import { cacheKeys } from '@/utils/cache';

const adapter = new NpmAdapter();

/**
 * Hook for fetching package data with caching
 */
export function usePackage(packageName: string, enabled: boolean = true) {
  return useQueries({
    queries: [
      {
        queryKey: cacheKeys.package(packageName),
        queryFn: async () => {
          const request: PkgCompareRequest = {
            packageName,
            ecosystem: 'npm',
          };
          return adapter.fetch(request);
        },
        enabled: enabled && !!packageName,
        staleTime: 60 * 60 * 1000,
        gcTime: 7 * 24 * 60 * 60 * 1000,
      },
    ],
  })[0];
}

/**
 * Hook for comparing multiple packages
 */
export function usePackageComparison(packageNames: string[]) {
  const results = useQueries({
    queries: packageNames.map((name) => ({
      queryKey: cacheKeys.package(name),
      queryFn: async () => {
        const request: PkgCompareRequest = {
          packageName: name,
          ecosystem: 'npm',
        };
        return adapter.fetch(request);
      },
      enabled: !!name,
      staleTime: 60 * 60 * 1000,
      gcTime: 7 * 24 * 60 * 60 * 1000,
    })),
  });

  const packages: PackageStats[] = results
    .map((result) => result.data)
    .filter((pkg): pkg is PackageStats => pkg !== undefined);

  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);
  const errors = results.map((result) => result.error).filter((err): err is Error => err !== undefined);

  return {
    isLoading,
    isError,
    errors,
    packages,
  };
}

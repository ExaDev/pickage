import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
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
 * Hook for comparing multiple packages with separate npm and GitHub queries
 */
export function usePackageComparison(packageNames: string[]) {
  const queryClient = useQueryClient();

  // Fetch npm data (from npms.io) for all packages
  const npmResults = useQueries({
    queries: packageNames.map((name) => ({
      queryKey: cacheKeys.package(name),
      queryFn: async () => adapter.fetchNpmData(name),
      enabled: !!name,
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
      retry: 1,
    })),
  });

  // Create a map of package name to repository URL for GitHub queries
  const repoUrls = useMemo(() => {
    const urls: Record<string, string | null> = {};
    npmResults.forEach((result, index) => {
      if (result.data?.repository) {
        urls[packageNames[index]] = result.data.repository;
      } else {
        urls[packageNames[index]] = null;
      }
    });
    return urls;
  }, [npmResults, packageNames]);

  // Fetch GitHub data for packages that have repository URLs
  const githubResults = useQueries({
    queries: packageNames.map((name) => ({
      queryKey: cacheKeys.githubRepo(repoUrls[name] ?? ""),
      queryFn: async () => {
        const repoUrl = repoUrls[name];
        if (!repoUrl) return null;
        return adapter.fetchGithubData(repoUrl);
      },
      enabled: !!repoUrls[name],
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
      retry: 1,
    })),
  });

  // Combine npm and GitHub data into PackageStats
  const packages: PackageStats[] = useMemo(() => {
    return packageNames
      .map((_, index) => {
        const npmData = npmResults[index]?.data;
        const githubData = githubResults[index]?.data;

        if (!npmData) return undefined;

        const stats: PackageStats = {
          name: npmData.name,
          description: npmData.description,
          version: npmData.version,
          homepage: npmData.homepage,
          repository: npmData.repository,
          quality: npmData.quality,
          popularity: npmData.popularity,
          maintenance: npmData.maintenance,
          finalScore: npmData.finalScore,
          weeklyDownloads: npmData.weeklyDownloads,
          dependentsCount: npmData.dependentsCount,
          npm: npmData.npm,
          author: npmData.author,
          maintainers: npmData.maintainers,
          links: npmData.links,
          evaluation: npmData.evaluation,
        };

        // Use GitHub data from API if available, otherwise fall back to npms.io data
        if (githubData) {
          stats.stars = githubData.stars;
          stats.forks = githubData.forks;
          stats.openIssues = githubData.openIssues;
          stats.github = githubData.github;
        } else if (npmData.githubFromNpms) {
          stats.stars = npmData.githubFromNpms.stars;
          stats.forks = npmData.githubFromNpms.forks;
          stats.openIssues = npmData.githubFromNpms.openIssues;
          stats.github = {
            stars: npmData.githubFromNpms.stars,
            forks: npmData.githubFromNpms.forks,
            openIssues: npmData.githubFromNpms.openIssues,
            subscribers: npmData.githubFromNpms.subscribers,
          };
        }

        return stats;
      })
      .filter((pkg): pkg is PackageStats => pkg !== undefined);
  }, [npmResults, githubResults, packageNames]);

  const isLoading = npmResults.some((result) => result.isLoading);
  const isError = npmResults.some((result) => result.isError);
  const errors = npmResults
    .map((result) => result.error)
    .filter((err): err is Error => err != null);

  // Track which packages failed to load due to not being found (404)
  // Only auto-remove packages that don't exist, not for server errors
  const failedPackages: string[] = npmResults
    .map((result, index) => {
      // Check if error message indicates package not found (404)
      const isNotFound =
        result.error instanceof Error &&
        result.error.message.includes("not found");
      return {
        name: packageNames[index],
        failed: result.isError && isNotFound,
      };
    })
    .filter((item) => item.failed)
    .map((item) => item.name);

  // Track which packages are currently refetching npm data
  const refetchingNpmPackages: Record<string, boolean> = {};
  npmResults.forEach((result, index) => {
    refetchingNpmPackages[packageNames[index]] =
      result.isFetching && !result.isLoading;
  });

  // Track which packages are currently refetching GitHub data
  const refetchingGithubPackages: Record<string, boolean> = {};
  githubResults.forEach((result, index) => {
    refetchingGithubPackages[packageNames[index]] =
      result.isFetching && !result.isLoading;
  });

  // Refetch npm data for a specific package
  const refetchNpmData = useCallback(
    async (packageName: string) => {
      await queryClient.invalidateQueries({
        queryKey: cacheKeys.package(packageName),
      });
    },
    [queryClient],
  );

  // Refetch GitHub data for a specific package
  const refetchGithubData = useCallback(
    async (packageName: string) => {
      const repoUrl = repoUrls[packageName];
      if (repoUrl) {
        await queryClient.invalidateQueries({
          queryKey: cacheKeys.githubRepo(repoUrl),
        });
      }
    },
    [queryClient, repoUrls],
  );

  // Legacy: refetch both npm and GitHub data
  const refetchPackage = useCallback(
    async (packageName: string) => {
      await Promise.all([
        refetchNpmData(packageName),
        refetchGithubData(packageName),
      ]);
    },
    [refetchNpmData, refetchGithubData],
  );

  return {
    isLoading,
    isError,
    errors,
    packages,
    failedPackages,
    refetchingNpmPackages,
    refetchingGithubPackages,
    refetchNpmData,
    refetchGithubData,
    // Legacy compatibility
    refetchingPackages: refetchingNpmPackages,
    refetchPackage,
  };
}

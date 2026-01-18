import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { NpmAdapter } from "@/adapters/npm";
import { PyPiAdapter } from "@/adapters/pypi";
import type { PickageRequest, PackageStats } from "@/types/adapter";
import { cacheKeys } from "@/utils/cache";

const npmAdapter = new NpmAdapter();
const pypiAdapter = new PyPiAdapter();

// Input type for package requests with explicit ecosystem
export interface PackageRequest {
  packageName: string;
  ecosystem: "npm" | "pypi";
}

// 72 hours in milliseconds
const STALE_TIME = 72 * 60 * 60 * 1000;
const GC_TIME = 7 * 24 * 60 * 60 * 1000;

/**
 * Hook for fetching package data with caching
 * @deprecated Use usePackageComparison which accepts explicit ecosystem info
 */
export function usePackage(
  packageName: string,
  ecosystem: "npm" | "pypi" = "npm",
  enabled: boolean = true,
) {
  return useQueries({
    queries: [
      {
        queryKey: cacheKeys.package(packageName),
        queryFn: async () => {
          const request: PickageRequest = {
            packageName,
            ecosystem,
          };
          const adapter = ecosystem === "pypi" ? pypiAdapter : npmAdapter;
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
 * @param packages - Array of package requests with explicit ecosystem info
 */
export function usePackageComparison(packages: PackageRequest[]) {
  const queryClient = useQueryClient();

  // Extract package names and ecosystems
  const packageNames = packages.map((p) => p.packageName);
  const ecosystems = packages.map((p) => p.ecosystem);

  // Fetch package data (from appropriate ecosystem) for all packages
  const packageResults = useQueries({
    queries: packages.map((pkg) => ({
      queryKey: cacheKeys.package(pkg.packageName, pkg.ecosystem),
      queryFn: async () => {
        const request: PickageRequest = {
          packageName: pkg.packageName,
          ecosystem: pkg.ecosystem,
        };
        const adapter = pkg.ecosystem === "pypi" ? pypiAdapter : npmAdapter;

        // For npm packages, use the optimized fetchNpmData method
        // For other ecosystems, use the regular fetch method
        if (pkg.ecosystem === "npm" && "fetchNpmData" in adapter) {
          return adapter.fetchNpmData(pkg.packageName);
        }
        return adapter.fetch(request);
      },
      enabled: !!pkg.packageName,
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
      retry: 1,
    })),
  });

  // Create a map of package name to repository URL for GitHub queries
  // Only for npm packages
  const repoUrls = useMemo(() => {
    const urls: Record<string, string | null> = {};
    packageResults.forEach((result, index) => {
      if (ecosystems[index] === "npm" && result.data?.repository) {
        urls[packageNames[index]] = result.data.repository;
      } else {
        urls[packageNames[index]] = null;
      }
    });
    return urls;
  }, [packageResults, packageNames, ecosystems]);

  // Fetch GitHub data for npm packages that have repository URLs
  const githubResults = useQueries({
    queries: packages.map((pkg) => ({
      queryKey: cacheKeys.githubRepo(repoUrls[pkg.packageName] ?? ""),
      queryFn: async () => {
        const repoUrl = repoUrls[pkg.packageName];
        if (!repoUrl) return null;
        // GitHub data is only relevant for npm packages
        if (pkg.ecosystem !== "npm") return null;
        return npmAdapter.fetchGithubData(repoUrl);
      },
      enabled: !!repoUrls[pkg.packageName] && pkg.ecosystem === "npm",
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
      retry: 1,
    })),
  });

  // Combine data from appropriate ecosystems into PackageStats
  const packagesData: PackageStats[] = useMemo(() => {
    return packages
      .map((pkg, index) => {
        const packageData = packageResults[index]?.data;
        const ecosystem = pkg.ecosystem;

        if (!packageData) return undefined;

        const stats: PackageStats = {
          name: packageData.name,
          description: packageData.description,
          version: packageData.version,
          homepage: packageData.homepage,
          repository: packageData.repository,
          maintenance: packageData.maintenance,
          author: packageData.author,
          links: packageData.links,
        };

        // Add lastPublish if available
        if ("lastPublish" in packageData && packageData.lastPublish) {
          stats.lastPublish = packageData.lastPublish;
        }

        // Add npm-specific data
        if (ecosystem === "npm" && "npm" in packageData) {
          stats.quality = packageData.quality;
          stats.popularity = packageData.popularity;
          stats.finalScore = packageData.finalScore;
          stats.weeklyDownloads = packageData.weeklyDownloads;
          stats.dependentsCount = packageData.dependentsCount;
          stats.npm = packageData.npm;
          stats.maintainers = packageData.maintainers;
          stats.contributors = packageData.contributors;
          stats.evaluation = packageData.evaluation;

          // Add GitHub data from API if available
          const githubData = githubResults[index]?.data;
          if (githubData) {
            stats.stars = githubData.stars;
            stats.forks = githubData.forks;
            stats.openIssues = githubData.openIssues;
            stats.github = githubData.github;
          } else if (
            "githubFromNpms" in packageData &&
            packageData.githubFromNpms
          ) {
            // Fall back to GitHub data from npms.io
            stats.stars = packageData.githubFromNpms.stars;
            stats.forks = packageData.githubFromNpms.forks;
            stats.openIssues = packageData.githubFromNpms.openIssues;
            stats.github = {
              stars: packageData.githubFromNpms.stars,
              forks: packageData.githubFromNpms.forks,
              openIssues: packageData.githubFromNpms.openIssues,
              subscribers: packageData.githubFromNpms.subscribers,
            };
          }
        }

        // Add pypi-specific data
        if ("pypi" in packageData && packageData.pypi) {
          stats.pypi = packageData.pypi;
        }

        return stats;
      })
      .filter((pkg): pkg is PackageStats => pkg !== undefined);
  }, [packageResults, githubResults, packages, ecosystems]);

  const isLoading = packageResults.some((result) => result.isLoading);
  const isError = packageResults.some((result) => result.isError);
  const errors = packageResults
    .map((result) => result.error)
    .filter((err): err is Error => err != null);

  // Track which packages failed to load due to not being found (404)
  // Only auto-remove packages that don't exist, not for server errors
  const failedPackages: string[] = packageResults
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

  // Track which packages are currently refetching data
  const refetchingNpmPackages: Record<string, boolean> = {};
  packageResults.forEach((result, index) => {
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
    packages: packagesData,
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

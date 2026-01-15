import { useEffect, useRef } from "react";
import { notifications } from "@mantine/notifications";
import { usePackageComparison } from "@/hooks/usePackageComparison";
import type { PackageColumnState } from "@/hooks/usePackageColumn";
import type { ViewMode } from "@/types/views";
import { EmptyState } from "./EmptyState";
import { CarouselView, GridView, ListView, TableView } from "./views";

/**
 * Calculate which metrics each package wins at
 */
function calculateWinnerMetrics(
  packages: Array<{ name: string; stats: Record<string, number | undefined> }>,
): Record<string, Record<string, boolean>> {
  const numericalMetrics = [
    "weeklyDownloads",
    "totalDownloads",
    "stars",
    "forks",
    "openIssues",
    "quality",
    "popularity",
    "maintenance",
  ];

  const winners: Record<string, Record<string, boolean>> = {};

  // Initialize winners object for each package
  packages.forEach((pkg) => {
    winners[pkg.name] = {};
  });

  // Calculate winner for each metric
  numericalMetrics.forEach((metric) => {
    const values = packages.map((pkg) => ({
      name: pkg.name,
      value: pkg.stats[metric],
    }));

    const validValues = values.filter((v) => v.value !== undefined);
    if (validValues.length === 0) return;

    const maxValue = Math.max(...validValues.map((v) => v.value as number));

    // Mark winners
    values.forEach((v) => {
      if (v.value === maxValue) {
        winners[v.name][metric] = true;
      }
    });
  });

  return winners;
}

interface PackageComparisonLayoutProps {
  packages: PackageColumnState[];
  viewMode: ViewMode;
  removePackage: (id: string) => void;
  canRemove: boolean;
}

export function PackageComparisonLayout({
  packages: packageColumns,
  viewMode,
  removePackage,
  canRemove,
}: PackageComparisonLayoutProps) {
  // Extract package names for data fetching
  const packageNames = packageColumns.map((pkg) => pkg.packageName);

  // Fetch package data
  const {
    isLoading,
    packages: packagesData,
    failedPackages,
    refetchingPackages,
    refetchPackage,
  } = usePackageComparison(packageNames);

  // Track which packages we've already removed to avoid duplicate notifications
  const removedPackagesRef = useRef<Set<string>>(new Set());

  // Auto-remove packages that don't exist
  useEffect(() => {
    failedPackages.forEach((failedName) => {
      // Skip if we've already processed this package
      if (removedPackagesRef.current.has(failedName)) {
        return;
      }

      // Find the package column by name
      const failedColumn = packageColumns.find(
        (col) => col.packageName === failedName,
      );

      if (failedColumn) {
        removedPackagesRef.current.add(failedName);
        removePackage(failedColumn.id);

        notifications.show({
          title: "Package not found",
          message: `"${failedName}" was removed from comparison`,
          color: "red",
        });
      }
    });
  }, [failedPackages, packageColumns, removePackage]);

  // Calculate winner metrics
  const validPackages = packagesData.filter((pkg) =>
    packageNames.includes(pkg.name),
  );
  const winnerMetrics = calculateWinnerMetrics(
    validPackages.map((pkg) => ({
      name: pkg.name,
      stats: {
        weeklyDownloads: pkg.weeklyDownloads,
        totalDownloads: pkg.totalDownloads,
        stars: pkg.stars,
        forks: pkg.forks,
        openIssues: pkg.openIssues,
        quality: pkg.quality,
        popularity: pkg.popularity,
        maintenance: pkg.maintenance,
      },
    })),
  );

  // Show empty state when no packages added
  if (packageColumns.length === 0) {
    return <EmptyState />;
  }

  // Shared props for all view components
  const viewProps = {
    packages: packageColumns,
    packagesData,
    isLoading,
    winnerMetrics,
    canRemove,
    onRemove: removePackage,
    refetchingPackages,
    onRefresh: refetchPackage,
  };

  // Render based on view mode
  switch (viewMode) {
    case "carousel":
      return <CarouselView {...viewProps} />;
    case "grid":
      return <GridView {...viewProps} />;
    case "list":
      return <ListView {...viewProps} />;
    case "table":
      return <TableView {...viewProps} />;
    default:
      return <CarouselView {...viewProps} />;
  }
}

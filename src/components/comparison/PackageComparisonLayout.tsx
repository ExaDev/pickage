import { Box, Flex, ScrollArea, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { usePackageComparison } from "@/hooks/usePackageComparison";
import type { PackageColumnState } from "@/hooks/usePackageColumn";
import { PackageColumn } from "./PackageColumn";
import { EmptyState } from "./EmptyState";

const MOBILE_BREAKPOINT = 1024;

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
  removePackage: (id: string) => void;
  canRemove: boolean;
}

export function PackageComparisonLayout({
  packages: packageColumns,
  removePackage,
  canRemove,
}: PackageComparisonLayoutProps) {
  // Extract package names for data fetching
  const packageNames = packageColumns.map((pkg) => pkg.packageName);

  // Fetch package data
  const { isLoading, packages: packagesData } =
    usePackageComparison(packageNames);

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

  const isMobile = useMediaQuery(`(max-width: ${String(MOBILE_BREAKPOINT)}px)`);

  // Show empty state when no packages added
  if (packageColumns.length === 0) {
    return <EmptyState />;
  }

  if (isMobile) {
    // Mobile layout: Horizontal scroll with wider columns
    return (
      <Stack gap="xl">
        <ScrollArea.Autosize type="scroll" offsetScrollbars>
          <Flex
            gap="md"
            justify="center"
            style={{ minWidth: "min-content", paddingBottom: "16px" }}
          >
            {packageColumns.map((pkg) => {
              const packageStats =
                packagesData.find((p) => p.name === pkg.packageName) ?? null;

              return (
                <Box
                  key={pkg.id}
                  style={{ minWidth: "320px", flexShrink: 0, width: "320px" }}
                >
                  <PackageColumn
                    packageName={pkg.packageName}
                    packageStats={packageStats}
                    isLoading={isLoading}
                    showRemove={canRemove}
                    winnerMetrics={winnerMetrics[pkg.packageName]}
                    onRemove={() => {
                      removePackage(pkg.id);
                    }}
                  />
                </Box>
              );
            })}
          </Flex>
        </ScrollArea.Autosize>
      </Stack>
    );
  }

  // Desktop layout: Flexible columns that expand to use available space
  // For 1-2 packages: expand to fill width (max 600px for readability)
  // For 3+ packages: horizontal scroll with wider columns
  const columnCount = packageColumns.length;
  const useFlexibleLayout = columnCount <= 2;

  return (
    <Stack gap="xl">
      <ScrollArea.Autosize type="scroll" offsetScrollbars>
        <Flex
          gap="xl"
          justify="center"
          style={{
            minWidth: "min-content",
            paddingBottom: "16px",
            width: useFlexibleLayout ? "100%" : undefined,
          }}
        >
          {packageColumns.map((pkg) => {
            const packageStats =
              packagesData.find((p) => p.name === pkg.packageName) ?? null;

            return (
              <Box
                key={pkg.id}
                style={
                  useFlexibleLayout
                    ? {
                        flex: 1,
                        minWidth: "350px",
                        maxWidth: "600px",
                      }
                    : {
                        width: "450px",
                        flexShrink: 0,
                      }
                }
              >
                <PackageColumn
                  packageName={pkg.packageName}
                  packageStats={packageStats}
                  isLoading={isLoading}
                  showRemove={canRemove}
                  winnerMetrics={winnerMetrics[pkg.packageName]}
                  onRemove={() => {
                    removePackage(pkg.id);
                  }}
                />
              </Box>
            );
          })}
        </Flex>
      </ScrollArea.Autosize>
    </Stack>
  );
}

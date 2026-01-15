import { Box, Flex, ScrollArea, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { usePackageColumn } from "@/hooks/usePackageColumn";
import { usePackageComparison } from "@/hooks/usePackageComparison";
import { PackageColumn } from "./PackageColumn";
import { AddColumnButton } from "./AddColumnButton";
import { ReadmeAccordion } from "@/components/ui/ReadmeAccordion";

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

export function PackageComparisonLayout() {
  const {
    columns,
    addColumn,
    removeColumn,
    updateColumn,
    canAddMore,
    canRemove,
  } = usePackageColumn();

  // Extract package names from submitted values (not current typing)
  const packageNames = columns
    .map((col) => col.submittedValue)
    .filter((name) => name.trim().length > 0);

  // Fetch package data
  const { isLoading, packages } = usePackageComparison(packageNames);

  // Calculate winner metrics
  const validPackages = packages.filter((pkg) =>
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

  // Check if any packages have READMEs to show
  const packagesWithData = packages.filter((pkg) =>
    packageNames.includes(pkg.name),
  );

  if (isMobile) {
    // Mobile layout: Horizontal scroll
    return (
      <Stack gap="xl">
        <ScrollArea.Autosize type="scroll" offsetScrollbars>
          <Flex
            gap="md"
            justify="center"
            style={{ minWidth: "min-content", paddingBottom: "16px" }}
          >
            {columns.map((col) => {
              const packageName = col.submittedValue.trim();
              const packageStats =
                packageName && packageNames.includes(packageName)
                  ? (packages.find((p) => p.name === packageName) ?? null)
                  : null;

              return (
                <Box
                  key={col.id}
                  style={{ minWidth: "280px", flexShrink: 0, width: "280px" }}
                >
                  <PackageColumn
                    columnState={col}
                    index={columns.indexOf(col)}
                    packageStats={packageStats}
                    isLoading={isLoading && !!packageName}
                    showRemove={canRemove}
                    winnerMetrics={
                      packageName ? winnerMetrics[packageName] : undefined
                    }
                    onUpdate={(updates) => {
                      updateColumn(col.id, updates);
                    }}
                    onRemove={() => {
                      removeColumn(col.id);
                    }}
                  />
                </Box>
              );
            })}
          </Flex>
          <AddColumnButton
            onClick={addColumn}
            disabled={!canAddMore}
            currentColumnCount={columns.length}
          />
        </ScrollArea.Autosize>

        {/* README Section */}
        {packagesWithData.length > 0 && (
          <ReadmeAccordion packages={packagesWithData} />
        )}
      </Stack>
    );
  }

  // Desktop layout: Horizontal scroll with centered columns
  return (
    <Stack gap="xl">
      <Box pos="relative">
        <ScrollArea.Autosize type="scroll" offsetScrollbars>
          <Flex
            gap="xl"
            justify="center"
            style={{ minWidth: "min-content", paddingBottom: "16px" }}
          >
            {columns.map((col) => {
              const packageName = col.submittedValue.trim();
              const packageStats =
                packageName && packageNames.includes(packageName)
                  ? (packages.find((p) => p.name === packageName) ?? null)
                  : null;

              return (
                <Box key={col.id} style={{ width: "350px", flexShrink: 0 }}>
                  <PackageColumn
                    columnState={col}
                    index={columns.indexOf(col)}
                    packageStats={packageStats}
                    isLoading={isLoading && !!packageName}
                    showRemove={canRemove}
                    winnerMetrics={
                      packageName ? winnerMetrics[packageName] : undefined
                    }
                    onUpdate={(updates) => {
                      updateColumn(col.id, updates);
                    }}
                    onRemove={() => {
                      removeColumn(col.id);
                    }}
                  />
                </Box>
              );
            })}
          </Flex>
        </ScrollArea.Autosize>
        <Box
          pos="absolute"
          right="0"
          top="50%"
          style={{ transform: "translateY(-50%)" }}
        >
          <AddColumnButton
            onClick={addColumn}
            disabled={!canAddMore}
            currentColumnCount={columns.length}
          />
        </Box>
      </Box>

      {/* README Section */}
      {packagesWithData.length > 0 && (
        <ReadmeAccordion packages={packagesWithData} />
      )}
    </Stack>
  );
}

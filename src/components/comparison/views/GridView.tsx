import { SimpleGrid } from "@mantine/core";
import { PackageColumn } from "../PackageColumn";
import type { ViewProps } from "./types";

/**
 * Grid view - responsive grid of package cards
 * Good for comparing 4-6+ packages at a glance
 */
export function GridView({
  packages,
  packagesData,
  isLoading,
  winnerMetrics,
  canRemove,
  onRemove,
}: ViewProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
      {packages.map((pkg) => {
        const packageStats =
          packagesData.find((p) => p.name === pkg.packageName) ?? null;

        return (
          <PackageColumn
            key={pkg.id}
            packageName={pkg.packageName}
            packageStats={packageStats}
            isLoading={isLoading}
            showRemove={canRemove}
            winnerMetrics={winnerMetrics[pkg.packageName]}
            onRemove={() => {
              onRemove(pkg.id);
            }}
          />
        );
      })}
    </SimpleGrid>
  );
}

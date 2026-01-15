import { Stack } from "@mantine/core";
import { PackageColumn } from "../PackageColumn";
import type { ViewProps } from "./types";

/**
 * List view - vertical stack of full-width package cards
 * Easy vertical scanning of packages
 */
export function ListView({
  packages,
  packagesData,
  isLoading,
  winnerMetrics,
  canRemove,
  onRemove,
}: ViewProps) {
  return (
    <Stack gap="lg">
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
    </Stack>
  );
}

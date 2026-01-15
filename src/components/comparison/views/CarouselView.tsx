import { Box, Flex, ScrollArea } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { PackageColumn } from "../PackageColumn";
import type { ViewProps } from "./types";

const MOBILE_BREAKPOINT = 1024;

/**
 * Carousel view - horizontal layout with flexible columns
 * Fills available viewport width and height with horizontal scroll when needed
 */
export function CarouselView({
  packages,
  packagesData,
  isLoading,
  winnerMetrics,
  canRemove,
  onRemove,
  refetchingNpmPackages,
  onRefreshNpm,
  refetchingGithubPackages,
  onRefreshGithub,
}: ViewProps) {
  const isMobile = useMediaQuery(`(max-width: ${String(MOBILE_BREAKPOINT)}px)`);
  const columnCount = packages.length;

  // Calculate column sizing based on count
  // 1-2 packages: flexible, fill available space
  // 3+ packages: fixed width with horizontal scroll
  const useFlexibleLayout = columnCount <= 2;
  const columnMinWidth = isMobile ? 320 : useFlexibleLayout ? 400 : 450;

  return (
    <ScrollArea
      style={{ height: "100%", width: "100%" }}
      type="auto"
      offsetScrollbars
    >
      <Flex
        gap="lg"
        style={{
          height: "100%",
          minHeight: "100%",
          width: useFlexibleLayout ? "100%" : undefined,
          minWidth: useFlexibleLayout ? undefined : "min-content",
          padding: "var(--mantine-spacing-md)",
        }}
      >
        {packages.map((pkg) => {
          const packageStats =
            packagesData.find((p) => p.name === pkg.packageName) ?? null;

          return (
            <Box
              key={pkg.id}
              style={
                useFlexibleLayout
                  ? {
                      flex: 1,
                      minWidth: `${String(columnMinWidth)}px`,
                    }
                  : {
                      width: `${String(columnMinWidth)}px`,
                      minWidth: `${String(columnMinWidth)}px`,
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
                  onRemove(pkg.id);
                }}
                onRefreshNpm={() => {
                  onRefreshNpm(pkg.packageName);
                }}
                onRefreshGithub={() => {
                  onRefreshGithub(pkg.packageName);
                }}
                isRefetchingNpm={refetchingNpmPackages[pkg.packageName]}
                isRefetchingGithub={refetchingGithubPackages[pkg.packageName]}
              />
            </Box>
          );
        })}
      </Flex>
    </ScrollArea>
  );
}

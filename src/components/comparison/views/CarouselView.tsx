import { Box, Flex, ScrollArea, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { PackageColumn } from "../PackageColumn";
import type { ViewProps } from "./types";

const MOBILE_BREAKPOINT = 1024;

/**
 * Carousel view - horizontal scroll with side-by-side columns
 * Current default view with flexible sizing for 1-2 packages
 */
export function CarouselView({
  packages,
  packagesData,
  isLoading,
  winnerMetrics,
  canRemove,
  onRemove,
  refetchingPackages,
  onRefresh,
}: ViewProps) {
  const isMobile = useMediaQuery(`(max-width: ${String(MOBILE_BREAKPOINT)}px)`);

  if (isMobile) {
    // Mobile layout: Horizontal scroll with fixed columns
    return (
      <Stack gap="xl">
        <ScrollArea.Autosize type="scroll" offsetScrollbars>
          <Flex
            gap="md"
            justify="center"
            style={{ minWidth: "min-content", paddingBottom: "16px" }}
          >
            {packages.map((pkg) => {
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
                    isRefetching={refetchingPackages[pkg.packageName]}
                    showRemove={canRemove}
                    winnerMetrics={winnerMetrics[pkg.packageName]}
                    onRemove={() => {
                      onRemove(pkg.id);
                    }}
                    onRefresh={() => {
                      onRefresh(pkg.packageName);
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

  // Desktop layout: Flexible columns for 1-2 packages, fixed for 3+
  const columnCount = packages.length;
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
                  isRefetching={refetchingPackages[pkg.packageName]}
                  showRemove={canRemove}
                  winnerMetrics={winnerMetrics[pkg.packageName]}
                  onRemove={() => {
                    onRemove(pkg.id);
                  }}
                  onRefresh={() => {
                    onRefresh(pkg.packageName);
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

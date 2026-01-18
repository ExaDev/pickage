import { Box, Card, ScrollArea } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  HeaderSection,
  NpmsScoresSection,
  ComparisonResultsSection,
  RegistrySection,
  GitHubSection,
  ReadmeSection,
} from "../sections";
import { SortSidebar } from "../SortSidebar";
import type { WinnerMetrics } from "../sections/types";
import type { ViewProps } from "./types";
import type { PackageStats } from "@/types/adapter";

const MOBILE_BREAKPOINT = 1024;

/**
 * Grid row definitions for aligned layout.
 * Each section defines its rows, and sections use subgrid to inherit sizing.
 */
const GRID_ROWS = {
  // Header section rows
  header: {
    title: 1, // Package name + remove button
    description: 1, // Description text
    badges: 1, // Version + language badges
    links: 1, // External links
  },
  // Scores section rows
  scores: {
    title: 1, // Section header
    overall: 1, // Overall score badge
    quality: 1, // Quality score
    popularity: 1, // Popularity score
    maintenance: 1, // Maintenance score
    qualityTitle: 1, // "Quality Breakdown"
    tests: 1,
    health: 1,
    carefulness: 1,
    branding: 1,
    maintTitle: 1, // "Maintenance Breakdown"
    releasesFreq: 1,
    commitsFreq: 1,
    openIssues: 1,
    issuesDist: 1,
  },
  // Comparison section
  comparison: {
    badges: 1, // Winner badges
  },
  // Unified Registry section rows (all possible rows across both ecosystems)
  registry: {
    title: 1, // Section header
    // npm-specific rows
    downloads: 1,
    dependents: 1,
    // PyPI-specific rows
    requiresPython: 1,
    uploads: 1,
    lastUpload: 1,
    classifiers: 1,
    // Shared rows (both ecosystems) - these align!
    license: 1,
    dependencies: 1,
    author: 1,
    // npm-specific rows
    keywords: 1,
    maintainers: 1,
  },
  // GitHub section rows
  github: {
    title: 1,
    stars: 1,
    forks: 1,
    issues: 1,
    watchers: 1,
    lastPush: 1,
    created: 1,
    updated: 1,
    size: 1,
    branch: 1,
    contributors: 1,
  },
  // README section is NOT part of the grid - it grows to fit content
};

// Calculate row counts for each section (README excluded - it's not aligned)
const SECTION_ROW_COUNTS = {
  header: Object.keys(GRID_ROWS.header).length,
  scores: Object.keys(GRID_ROWS.scores).length,
  comparison: Object.keys(GRID_ROWS.comparison).length,
  registry: Object.keys(GRID_ROWS.registry).length,
  github: Object.keys(GRID_ROWS.github).length,
};

/**
 * Calculate section positions for ALL packages.
 * All packages use the same positions regardless of whether they have data.
 * Sections reserve space even if a specific package doesn't have that data.
 */
function calculateSectionPositions(packagesData: PackageStats[]) {
  const positions: Record<string, number> = {
    header: 1,
  };

  let currentRow = 1 + SECTION_ROW_COUNTS.header;

  // Scores section - reserve space if ANY package has scores
  const hasAnyScores = packagesData.some((pkg) => pkg.evaluation);
  if (hasAnyScores) {
    positions.scores = currentRow;
    currentRow += SECTION_ROW_COUNTS.scores;
  }

  // Comparison section (always shown)
  positions.comparison = currentRow;
  currentRow += SECTION_ROW_COUNTS.comparison;

  // Unified Registry section (always shown)
  positions.registry = currentRow;
  currentRow += SECTION_ROW_COUNTS.registry;

  // GitHub section (always shown)
  positions.github = currentRow;

  return positions;
}

// Export for use by section components
export { SECTION_ROW_COUNTS };

/**
 * Carousel view - horizontal layout with aligned fields using CSS Grid subgrid
 * Every field row aligns across all package columns
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
  sortCriteria = [],
  onSortChange,
}: ViewProps) {
  const isMobile = useMediaQuery(`(max-width: ${String(MOBILE_BREAKPOINT)}px)`);
  const columnCount = packages.length;

  // Calculate section positions ONCE for all packages
  const sectionPositions = calculateSectionPositions(packagesData);

  // Calculate total rows needed
  const TOTAL_ROWS = sectionPositions.github + SECTION_ROW_COUNTS.github;

  const columnWidth = isMobile ? 320 : 450;
  const sidebarWidth = 48;

  // Grid columns: on mobile, no sidebar; on desktop, sidebar + fixed-width columns
  const gridColumnStyle = isMobile
    ? `repeat(${String(columnCount)}, ${String(columnWidth)}px)`
    : `${String(sidebarWidth)}px repeat(${String(columnCount)}, ${String(columnWidth)}px)`;

  return (
    <ScrollArea
      style={{ height: "100%", width: "100%" }}
      type="auto"
      offsetScrollbars
    >
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "var(--mantine-spacing-md)",
          minHeight: "100%",
        }}
      >
        {/* Metrics section - uses CSS Grid for cross-column alignment */}
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: gridColumnStyle,
            gridTemplateRows: `repeat(${String(TOTAL_ROWS)}, auto)`,
            columnGap: "var(--mantine-spacing-lg)",
            width: "fit-content",
            margin: "0 auto",
          }}
        >
          {/* Sort controls - render as direct grid children for row alignment (desktop only) */}
          {!isMobile &&
            onSortChange &&
            SortSidebar({
              sortCriteria,
              onSortChange,
            })}

          {packages.map((pkg, colIndex) => {
            const packageStats =
              packagesData.find(
                (p) => p.name.toLowerCase() === pkg.packageName.toLowerCase(),
              ) ?? null;

            const packageWinners = winnerMetrics[pkg.packageName] ?? {};
            const pkgWinnerMetrics: WinnerMetrics = {
              quality: packageWinners.quality,
              popularity: packageWinners.popularity,
              maintenance: packageWinners.maintenance,
              weeklyDownloads: packageWinners.weeklyDownloads,
              stars: packageWinners.stars,
              forks: packageWinners.forks,
              dependentsCount: packageWinners.dependentsCount,
            };

            // On mobile: no sidebar, packages start at column 1; on desktop: column 1 is sidebar, packages start at column 2
            const col = isMobile ? colIndex + 1 : colIndex + 2;

            return (
              <Card
                key={pkg.id}
                shadow="sm"
                padding={0}
                withBorder
                style={{
                  gridColumn: col,
                  gridRow: `1 / ${String(TOTAL_ROWS + 1)}`,
                  display: "grid",
                  gridTemplateRows: "subgrid",
                }}
              >
                {/* Header Section */}
                <Box
                  style={{
                    gridRow: `${String(sectionPositions.header)} / span ${String(SECTION_ROW_COUNTS.header)}`,
                    display: "grid",
                    gridTemplateRows: "subgrid",
                  }}
                >
                  <HeaderSection
                    packageName={packageStats?.name ?? pkg.packageName}
                    packageStats={packageStats}
                    isLoading={isLoading}
                    showRemove={canRemove}
                    onRemove={() => {
                      onRemove(pkg.id);
                    }}
                    rowCount={SECTION_ROW_COUNTS.header}
                  />
                </Box>

                {/* Scores Section */}
                {/* npms.io Scores Section (npm only) - always render to maintain grid alignment */}
                {sectionPositions.scores && (
                  <Box
                    style={{
                      gridRow: `${String(sectionPositions.scores)} / span ${String(SECTION_ROW_COUNTS.scores)}`,
                      display: "grid",
                      gridTemplateRows: "subgrid",
                    }}
                  >
                    {packageStats?.evaluation ? (
                      <NpmsScoresSection
                        packageStats={packageStats}
                        isLoading={isLoading}
                        rowCount={SECTION_ROW_COUNTS.scores}
                      />
                    ) : (
                      // Empty placeholder to maintain grid structure
                      <Box />
                    )}
                  </Box>
                )}

                {/* Comparison Section */}
                <Box
                  style={{
                    gridRow: `${String(sectionPositions.comparison)} / span ${String(SECTION_ROW_COUNTS.comparison)}`,
                    display: "grid",
                    gridTemplateRows: "subgrid",
                  }}
                >
                  <ComparisonResultsSection
                    winnerMetrics={pkgWinnerMetrics}
                    rowCount={SECTION_ROW_COUNTS.comparison}
                  />
                </Box>

                {/* Unified Registry Section - rows align across ecosystems */}
                <Box
                  style={{
                    gridRow: `${String(sectionPositions.registry)} / span ${String(SECTION_ROW_COUNTS.registry)}`,
                    display: "grid",
                    gridTemplateRows: "subgrid",
                  }}
                >
                  <RegistrySection
                    packageStats={packageStats}
                    isLoading={isLoading}
                    isRefetchingNpm={refetchingNpmPackages[pkg.packageName]}
                    onRefreshNpm={() => {
                      onRefreshNpm(pkg.packageName);
                    }}
                    rowCount={SECTION_ROW_COUNTS.registry}
                  />
                </Box>

                {/* GitHub Section */}
                <Box
                  style={{
                    gridRow: `${String(sectionPositions.github)} / span ${String(SECTION_ROW_COUNTS.github)}`,
                    display: "grid",
                    gridTemplateRows: "subgrid",
                  }}
                >
                  <GitHubSection
                    packageStats={packageStats}
                    isLoading={isLoading}
                    isRefetchingGithub={
                      refetchingGithubPackages[pkg.packageName]
                    }
                    onRefreshGithub={() => {
                      onRefreshGithub(pkg.packageName);
                    }}
                    rowCount={SECTION_ROW_COUNTS.github}
                  />
                </Box>
              </Card>
            );
          })}
        </Box>

        {/* README section - separate from grid, each column independent height */}
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: gridColumnStyle,
            columnGap: "var(--mantine-spacing-lg)",
            alignItems: "start",
            width: "fit-content",
            margin: "0 auto",
            marginTop: "calc(-1 * var(--mantine-radius-default))",
          }}
        >
          {/* Empty spacer for sidebar column (desktop only) */}
          {!isMobile && <Box style={{ gridColumn: 1 }} />}

          {packages.map((pkg, colIndex) => {
            const packageStats =
              packagesData.find(
                (p) => p.name.toLowerCase() === pkg.packageName.toLowerCase(),
              ) ?? null;

            return (
              <Card
                key={`readme-${pkg.id}`}
                shadow="sm"
                padding={0}
                withBorder
                style={{
                  gridColumn: isMobile ? colIndex + 1 : colIndex + 2,
                  borderTop: "none",
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                }}
              >
                <ReadmeSection packageStats={packageStats} />
              </Card>
            );
          })}
        </Box>
      </Box>
    </ScrollArea>
  );
}

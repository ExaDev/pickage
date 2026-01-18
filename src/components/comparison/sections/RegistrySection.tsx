import { Box, Group, Text, Badge, Tooltip } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import type { SectionProps } from "./types";

/**
 * Format large numbers with K/M suffix
 */
function formatNumber(num: number | undefined): string {
  if (num === undefined) return "N/A";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

/**
 * Format relative date
 */
function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${String(diffMins)}m ago`;
  if (diffHours < 24) return `${String(diffHours)}h ago`;
  if (diffDays < 7) return `${String(diffDays)}d ago`;
  if (diffDays < 30) return `${String(Math.floor(diffDays / 7))}w ago`;
  return date.toLocaleDateString();
}

interface MetricRowProps {
  label: string;
  value: string | number | null | undefined;
  tooltip?: string;
}

function MetricRow({ label, value, tooltip }: MetricRowProps) {
  return (
    <Group justify="space-between" wrap="nowrap" mb={0}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Tooltip
        label={
          tooltip ||
          (typeof value === "string" ? value : String(value ?? "N/A"))
        }
      >
        <Text size="sm" fw={500}>
          {typeof value === "number" ? formatNumber(value) : (value ?? "N/A")}
        </Text>
      </Tooltip>
    </Group>
  );
}

/**
 * Unified Registry Section - displays npm and PyPI metrics in aligned rows
 * Ecosystem-specific rows only render when data is available for that ecosystem
 * Shared rows (license, dependencies, author) align across all packages
 */
interface RegistrySectionProps extends SectionProps {
  isRefetchingNpm?: boolean;
  onRefreshNpm?: (packageName: string) => void;
  rowCount: number;
}

export function RegistrySection({
  packageStats,
  isRefetchingNpm,
  onRefreshNpm,
  rowCount,
}: RegistrySectionProps) {
  const hasNpm = Boolean(packageStats?.npm);
  const hasPyPI = Boolean(packageStats?.pypi);
  const sectionTitle =
    hasNpm && hasPyPI
      ? "npm & PyPI Registry"
      : hasNpm
        ? "npm Registry"
        : "PyPI Registry";

  const contentPadding = {
    paddingLeft: "var(--mantine-spacing-lg)",
    paddingRight: "var(--mantine-spacing-lg)",
  };

  return (
    <Box
      style={{
        display: "grid",
        gridTemplateRows: "subgrid",
        gridRow: `span ${String(rowCount)}`,
      }}
    >
      {/* Row 1: Section Header */}
      <Box py="xs" style={contentPadding}>
        <Group gap="xs" justify="space-between">
          <Group gap="xs">
            <Text size="sm" fw={600}>
              {sectionTitle}
            </Text>
            {isRefetchingNpm && (
              <IconRefresh
                size={14}
                style={{ animation: "spin 1s linear infinite" }}
              />
            )}
          </Group>
          {hasNpm && onRefreshNpm && (
            <Tooltip label="Refresh npm data">
              <IconRefresh
                size={14}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (packageStats?.name) {
                    onRefreshNpm(packageStats.name);
                  }
                }}
              />
            </Tooltip>
          )}
        </Group>
      </Box>

      {/* Row 2: npm-specific: Downloads */}
      <Box py="xs" style={contentPadding}>
        <MetricRow
          label="Weekly Downloads"
          value={hasNpm ? packageStats?.weeklyDownloads : null}
        />
      </Box>

      {/* Row 3: npm-specific: Dependents */}
      <Box py="xs" style={contentPadding}>
        <MetricRow
          label="Dependents"
          value={hasNpm ? packageStats?.dependentsCount : null}
          tooltip={hasNpm ? "Packages that depend on this package" : undefined}
        />
      </Box>

      {/* Row 4: PyPI-specific: Requires Python */}
      <Box py="xs" style={contentPadding}>
        <MetricRow
          label="Requires Python"
          value={hasPyPI ? (packageStats?.pypi?.requiresPython ?? "Any") : null}
        />
      </Box>

      {/* Row 5: PyPI-specific: Uploads */}
      <Box py="xs" style={contentPadding}>
        <MetricRow
          label="Total Uploads"
          value={hasPyPI ? packageStats?.pypi?.uploads : null}
        />
      </Box>

      {/* Row 6: PyPI-specific: Last Upload */}
      <Box py="xs" style={contentPadding}>
        <Group justify="space-between" mb={0}>
          <Text size="xs" c="dimmed">
            Last Upload
          </Text>
          <Tooltip
            label={
              hasPyPI && packageStats?.pypi?.upload_time
                ? new Date(packageStats.pypi.upload_time).toLocaleString()
                : "N/A"
            }
          >
            <Text size="sm">
              {hasPyPI && packageStats?.pypi?.upload_time
                ? formatRelativeDate(packageStats.pypi.upload_time)
                : "N/A"}
            </Text>
          </Tooltip>
        </Group>
      </Box>

      {/* Row 7: PyPI-specific: Classifiers */}
      <Box py="xs" style={contentPadding}>
        <Text size="xs" c="dimmed" mb={4}>
          Classifiers
          {hasPyPI &&
            packageStats?.pypi?.classifiers &&
            packageStats.pypi.classifiers.length > 0 &&
            ` (${String(packageStats.pypi.classifiers.length)})`}
        </Text>
        {hasPyPI &&
        packageStats?.pypi?.classifiers &&
        packageStats.pypi.classifiers.length > 0 ? (
          <Group gap={4}>
            {packageStats.pypi.classifiers.slice(0, 5).map((c) => (
              <Badge key={c} size="xs" variant="outline">
                {c.replace(/^[^:]+::\s*/, "")}
              </Badge>
            ))}
            {packageStats.pypi.classifiers.length > 5 && (
              <Badge size="xs" variant="light">
                +{String(packageStats.pypi.classifiers.length - 5)} more
              </Badge>
            )}
          </Group>
        ) : (
          <Text size="sm" c="dimmed">
            N/A
          </Text>
        )}
      </Box>

      {/* Row 8: Shared: License */}
      <Box py="xs" style={contentPadding}>
        <MetricRow
          label="License"
          value={packageStats?.npm?.license ?? packageStats?.pypi?.license}
        />
      </Box>

      {/* Row 9: Shared: Dependencies */}
      <Box py="xs" style={contentPadding}>
        <MetricRow
          label="Dependencies"
          value={
            packageStats?.npm
              ? packageStats.npm.dependencies.length
              : packageStats?.pypi
                ? packageStats.pypi.dependencies.length
                : undefined
          }
        />
      </Box>

      {/* Row 10: Shared: Author */}
      <Box py="xs" style={contentPadding}>
        <MetricRow label="Author" value={packageStats?.author?.name} />
      </Box>

      {/* Row 11: npm-specific: Keywords */}
      <Box py="xs" style={contentPadding}>
        <Text size="xs" c="dimmed" mb={4}>
          Keywords
        </Text>
        {hasNpm &&
        packageStats?.npm?.keywords &&
        packageStats.npm.keywords.length > 0 ? (
          <Group gap={4}>
            {packageStats.npm.keywords.slice(0, 5).map((kw) => (
              <Badge key={kw} size="xs" variant="outline">
                {kw}
              </Badge>
            ))}
            {packageStats.npm.keywords.length > 5 && (
              <Badge size="xs" variant="light">
                +{String(packageStats.npm.keywords.length - 5)} more
              </Badge>
            )}
          </Group>
        ) : (
          <Text size="sm" c="dimmed">
            N/A
          </Text>
        )}
      </Box>

      {/* Row 12: npm-specific: Maintainers */}
      <Box py="xs" style={contentPadding}>
        <Text size="xs" c="dimmed" mb={4}>
          Maintainers
          {hasNpm &&
            packageStats?.maintainers &&
            packageStats.maintainers.length > 0 &&
            ` (${String(packageStats.maintainers.length)})`}
        </Text>
        {hasNpm &&
        packageStats?.maintainers &&
        packageStats.maintainers.length > 0 ? (
          <Group gap={4}>
            {packageStats.maintainers.slice(0, 3).map((m, i) => (
              <Badge key={i} size="xs" variant="outline">
                {typeof m === "string" ? m : m.name}
              </Badge>
            ))}
            {packageStats.maintainers.length > 3 && (
              <Badge size="xs" variant="light">
                +{String(packageStats.maintainers.length - 3)} more
              </Badge>
            )}
          </Group>
        ) : (
          <Text size="sm" c="dimmed">
            N/A
          </Text>
        )}
      </Box>
    </Box>
  );
}

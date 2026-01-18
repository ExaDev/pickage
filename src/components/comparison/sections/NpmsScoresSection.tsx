import { Badge, Box, Group, Skeleton, Text, Tooltip } from "@mantine/core";
import { IconCalculator, IconInfoCircle } from "@tabler/icons-react";
import type { PackageStats } from "@/types/adapter";

interface NpmsScoresSectionProps {
  packageStats: PackageStats | null;
  isLoading: boolean;
  rowCount: number;
}

function getScoreColor(score: number | undefined): "green" | "yellow" | "red" {
  if (score === undefined) return "red";
  if (score > 80) return "green";
  if (score > 60) return "yellow";
  return "red";
}

/**
 * Format metrics with K/M suffix (handles negative values)
 */
function formatMetric(num: number | undefined): string {
  if (num === undefined) return "N/A";
  const absNum = Math.abs(num);
  const formatted =
    absNum >= 1_000_000
      ? `${(absNum / 1_000_000).toFixed(1)}M`
      : absNum >= 1_000
        ? `${(absNum / 1_000).toFixed(1)}K`
        : absNum.toLocaleString();
  return num < 0 ? `-${formatted}` : formatted;
}

const CALCULATION_TOOLTIPS = {
  finalScore:
    "Weighted combination of Quality (30%), Popularity (35%), and Maintenance (35%) scores",
  quality:
    "Based on: test coverage detection, code health indicators, linting/TypeScript usage, README quality and description",
  popularity:
    "Based on: community interest (stars + forks), download volume, download growth rate, packages depending on this",
  maintenance:
    "Based on: release frequency, commit frequency, issue response time, issue resolution distribution",
  communityInterest: "Score based on GitHub stars and forks",
  downloadsCount: "Score based on weekly download volume",
  downloadsAcceleration: "Score based on download growth rate over time",
  dependentsCount: "Score based on number of packages that depend on this",
  tests: "Detects presence of test frameworks and test files in the repository",
  health:
    "Checks for .npmignore, lockfiles, shrinkwrap, and other health indicators",
  carefulness: "Checks for linting setup, TypeScript, and code quality tooling",
  branding:
    "Evaluates README presence, quality, and package description completeness",
  releasesFrequency: "How frequently new versions are published to npm",
  commitsFrequency: "How frequently commits are made to the repository",
  openIssues: "Score based on how quickly issues receive responses",
  issuesDistribution: "Score based on issue resolution time distribution",
};

function MetricRow({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string;
  tooltip?: string;
}) {
  return (
    <Group justify="space-between" px="lg" py="xs">
      <Group gap={4}>
        <Text size="xs" c="dimmed">
          {label}
        </Text>
        {tooltip && (
          <Tooltip label={tooltip} multiline w={250}>
            <IconInfoCircle
              size={12}
              color="var(--mantine-color-dimmed)"
              style={{ cursor: "help" }}
            />
          </Tooltip>
        )}
      </Group>
      <Badge size="xs" variant="light">
        {value}
      </Badge>
    </Group>
  );
}

export function NpmsScoresSection({
  packageStats,
  isLoading,
  rowCount,
}: NpmsScoresSectionProps) {
  const px = "lg";
  const py = "xs";

  if (isLoading) {
    return (
      <Box
        style={{
          display: "grid",
          gridTemplateRows: "subgrid",
          gridRow: `span ${String(rowCount)}`,
        }}
      >
        {Array.from({ length: rowCount }).map((_, i) => (
          <Box key={i} px={px} py={py}>
            <Skeleton height={16} width={i === 0 ? "40%" : "100%"} />
          </Box>
        ))}
      </Box>
    );
  }

  const quality = packageStats?.evaluation?.quality;
  const popularity = packageStats?.evaluation?.popularity;
  const maintenance = packageStats?.evaluation?.maintenance;

  return (
    <Box
      style={{
        display: "grid",
        gridTemplateRows: "subgrid",
        gridRow: `span ${String(rowCount)}`,
      }}
    >
      {/* Row 1: Section title */}
      <Box px={px} py={py}>
        <Group gap="xs">
          <IconCalculator size={18} color="var(--mantine-color-violet-6)" />
          <Text size="sm" fw={600}>
            npms.io Scores
          </Text>
          <Tooltip
            label="Normalized 0-100 scores calculated by npms.io"
            multiline
            w={280}
          >
            <IconInfoCircle
              size={14}
              color="var(--mantine-color-dimmed)"
              style={{ cursor: "help" }}
            />
          </Tooltip>
        </Group>
      </Box>

      {/* Row 2: Overall Score */}
      <Group justify="space-between" px={px} py={py}>
        <Group gap={4}>
          <Text size="xs" c="dimmed">
            Overall Score
          </Text>
          <Tooltip label={CALCULATION_TOOLTIPS.finalScore} multiline w={250}>
            <IconInfoCircle
              size={12}
              color="var(--mantine-color-dimmed)"
              style={{ cursor: "help" }}
            />
          </Tooltip>
        </Group>
        <Badge
          color={getScoreColor(packageStats?.finalScore)}
          variant="filled"
          size="lg"
        >
          {packageStats?.finalScore ?? "N/A"}/100
        </Badge>
      </Group>

      {/* Row 3: Quality Score */}
      <Group justify="space-between" px={px} py={py}>
        <Group gap={4}>
          <Text size="xs" c="dimmed">
            Quality
          </Text>
          <Tooltip label={CALCULATION_TOOLTIPS.quality} multiline w={250}>
            <IconInfoCircle
              size={12}
              color="var(--mantine-color-dimmed)"
              style={{ cursor: "help" }}
            />
          </Tooltip>
        </Group>
        <Badge size="sm" color={getScoreColor(packageStats?.quality)}>
          {packageStats?.quality ?? "N/A"}
        </Badge>
      </Group>

      {/* Row 4: Popularity Score */}
      <Group justify="space-between" px={px} py={py}>
        <Group gap={4}>
          <Text size="xs" c="dimmed">
            Popularity
          </Text>
          <Tooltip label={CALCULATION_TOOLTIPS.popularity} multiline w={250}>
            <IconInfoCircle
              size={12}
              color="var(--mantine-color-dimmed)"
              style={{ cursor: "help" }}
            />
          </Tooltip>
        </Group>
        <Badge size="sm" color={getScoreColor(packageStats?.popularity)}>
          {packageStats?.popularity ?? "N/A"}
        </Badge>
      </Group>

      {/* Row 5: Maintenance Score */}
      <Group justify="space-between" px={px} py={py}>
        <Group gap={4}>
          <Text size="xs" c="dimmed">
            Maintenance
          </Text>
          <Tooltip label={CALCULATION_TOOLTIPS.maintenance} multiline w={250}>
            <IconInfoCircle
              size={12}
              color="var(--mantine-color-dimmed)"
              style={{ cursor: "help" }}
            />
          </Tooltip>
        </Group>
        <Badge size="sm" color={getScoreColor(packageStats?.maintenance)}>
          {packageStats?.maintenance ?? "N/A"}
        </Badge>
      </Group>

      {/* Row 6: Popularity Breakdown title */}
      <Box px={px} py={py}>
        <Text size="xs" fw={500}>
          Popularity Breakdown
        </Text>
      </Box>

      {/* Rows 7-10: Popularity metrics */}
      <MetricRow
        label="Community Interest"
        value={formatMetric(popularity?.communityInterest)}
        tooltip={CALCULATION_TOOLTIPS.communityInterest}
      />
      <MetricRow
        label="Downloads Count"
        value={formatMetric(popularity?.downloadsCount)}
        tooltip={CALCULATION_TOOLTIPS.downloadsCount}
      />
      <MetricRow
        label="Downloads Acceleration"
        value={formatMetric(popularity?.downloadsAcceleration)}
        tooltip={CALCULATION_TOOLTIPS.downloadsAcceleration}
      />
      <MetricRow
        label="Dependents Count"
        value={formatMetric(popularity?.dependentsCount)}
        tooltip={CALCULATION_TOOLTIPS.dependentsCount}
      />

      {/* Row 11: Quality Breakdown title */}
      <Box px={px} py={py}>
        <Text size="xs" fw={500}>
          Quality Breakdown
        </Text>
      </Box>

      {/* Rows 5-8: Quality metrics */}
      <MetricRow
        label="Tests"
        value={quality ? `${String(quality.tests)}%` : "N/A"}
        tooltip={CALCULATION_TOOLTIPS.tests}
      />
      <MetricRow
        label="Health"
        value={quality ? `${String(quality.health)}%` : "N/A"}
        tooltip={CALCULATION_TOOLTIPS.health}
      />
      <MetricRow
        label="Carefulness"
        value={quality ? `${String(quality.carefulness)}%` : "N/A"}
        tooltip={CALCULATION_TOOLTIPS.carefulness}
      />
      <MetricRow
        label="Branding"
        value={quality ? `${String(quality.branding)}%` : "N/A"}
        tooltip={CALCULATION_TOOLTIPS.branding}
      />

      {/* Row 9: Maintenance Breakdown title */}
      <Box px={px} py={py}>
        <Text size="xs" fw={500}>
          Maintenance Breakdown
        </Text>
      </Box>

      {/* Rows 10-13: Maintenance metrics */}
      <MetricRow
        label="Release Frequency"
        value={
          maintenance ? `${String(maintenance.releasesFrequency)}%` : "N/A"
        }
        tooltip={CALCULATION_TOOLTIPS.releasesFrequency}
      />
      <MetricRow
        label="Commit Frequency"
        value={maintenance ? `${String(maintenance.commitsFrequency)}%` : "N/A"}
        tooltip={CALCULATION_TOOLTIPS.commitsFrequency}
      />
      <MetricRow
        label="Open Issues"
        value={maintenance ? `${String(maintenance.openIssues)}%` : "N/A"}
        tooltip={CALCULATION_TOOLTIPS.openIssues}
      />
      <MetricRow
        label="Issues Distribution"
        value={
          maintenance ? `${String(maintenance.issuesDistribution)}%` : "N/A"
        }
        tooltip={CALCULATION_TOOLTIPS.issuesDistribution}
      />
    </Box>
  );
}

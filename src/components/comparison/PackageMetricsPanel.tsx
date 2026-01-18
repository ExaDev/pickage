import { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  Divider,
  Group,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import type { PackageStats } from "@/types/adapter";
import {
  IconBrandGithub,
  IconBrandNpm,
  IconCalculator,
  IconChevronDown,
  IconChevronUp,
  IconCode,
  IconExternalLink,
  IconInfoCircle,
  IconRefresh,
  IconTrophy,
} from "@tabler/icons-react";
import { getGravatarUrl } from "@/utils/gravatar";

interface PackageMetricsPanelProps {
  packageStats: PackageStats | null;
  isLoading: boolean;
  winnerMetrics?: {
    [key in keyof PackageStats]?: boolean;
  };
  isRefetchingNpm?: boolean;
  isRefetchingGithub?: boolean;
  onRefreshNpm?: () => void;
  onRefreshGithub?: () => void;
}

function formatNumber(value: number | undefined): string {
  if (value === undefined) return "N/A";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

function formatSize(sizeKb: number | undefined): string {
  if (sizeKb === undefined) return "N/A";
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} MB`;
  return `${String(sizeKb)} KB`;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatRelativeDate(dateStr: string | undefined): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${String(diffDays)} days ago`;
  if (diffDays < 30) return `${String(Math.floor(diffDays / 7))} weeks ago`;
  if (diffDays < 365) return `${String(Math.floor(diffDays / 30))} months ago`;
  return `${String(Math.floor(diffDays / 365))} years ago`;
}

function getScoreColor(score: number | undefined): "green" | "yellow" | "red" {
  if (score === undefined) return "red";
  if (score > 80) return "green";
  if (score > 60) return "yellow";
  return "red";
}

// Calculation explanation tooltips
const CALCULATION_TOOLTIPS = {
  finalScore:
    "Weighted combination of Quality (30%), Popularity (35%), and Maintenance (35%) scores",
  quality:
    "Based on: test coverage detection, code health indicators, linting/TypeScript usage, README quality and description",
  popularity:
    "Based on: community interest (stars + forks), download volume, download growth rate, packages depending on this",
  maintenance:
    "Based on: release frequency, commit frequency, issue response time, issue resolution distribution",
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
  communityInterest: "Combined stars and forks count from GitHub",
  downloadsCount: "Total download count used in popularity calculation",
  downloadsAcceleration: "Rate of change in downloads (growth or decline)",
  dependentsCount: "Number of packages that depend on this package",
};

/**
 * Metric row with optional tooltip and winner indicator
 */
function MetricRow({
  label,
  value,
  tooltip,
  isWinner,
  isBadge,
  badgeColor,
}: {
  label: string;
  value: string | number;
  tooltip?: string;
  isWinner?: boolean;
  isBadge?: boolean;
  badgeColor?: "green" | "yellow" | "red";
}) {
  return (
    <Group justify="space-between">
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
      <Group gap={4}>
        {isWinner && <IconTrophy size={12} color="orange" />}
        {isBadge ? (
          <Badge size="xs" variant="light" color={badgeColor}>
            {value}
          </Badge>
        ) : (
          <Text size="sm" fw={isWinner ? 700 : 400}>
            {value}
          </Text>
        )}
      </Group>
    </Group>
  );
}

export function PackageMetricsPanel({
  packageStats,
  isLoading,
  winnerMetrics = {},
  isRefetchingNpm = false,
  isRefetchingGithub = false,
  onRefreshNpm,
  onRefreshGithub,
}: PackageMetricsPanelProps) {
  const [maintainersExpanded, setMaintainersExpanded] = useState(false);
  const [contributorsExpanded, setContributorsExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [hasContributorOverflow, setHasContributorOverflow] = useState(false);
  const maintainersRef = useRef<HTMLDivElement>(null);
  const contributorsRef = useRef<HTMLDivElement>(null);

  // Detect if maintainers overflow the container
  const maintainersCount = packageStats?.maintainers?.length ?? 0;
  useEffect(() => {
    const checkOverflow = () => {
      const el = maintainersRef.current;
      if (el) {
        const originalMaxHeight = el.style.maxHeight;
        el.style.maxHeight = "none";
        const contentHeight = el.scrollHeight;
        el.style.maxHeight = originalMaxHeight;
        setHasOverflow(contentHeight > 33);
      }
    };
    const frameId = requestAnimationFrame(checkOverflow);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [maintainersCount]);

  // Detect if contributors overflow the container
  const contributorsCount = packageStats?.contributors?.length ?? 0;
  useEffect(() => {
    const checkOverflow = () => {
      const el = contributorsRef.current;
      if (el) {
        const originalMaxHeight = el.style.maxHeight;
        el.style.maxHeight = "none";
        const contentHeight = el.scrollHeight;
        el.style.maxHeight = originalMaxHeight;
        setHasContributorOverflow(contentHeight > 33);
      }
    };
    const frameId = requestAnimationFrame(checkOverflow);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [contributorsCount]);

  if (isLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={28} width="60%" />
        <Skeleton height={16} width="100%" />
        <Skeleton height={16} width="80%" />
        <Divider />
        <Stack gap={4}>
          <Skeleton height={12} width="40%" />
          <Skeleton height={20} width="60%" />
        </Stack>
        <Stack gap={4}>
          <Skeleton height={12} width="40%" />
          <Skeleton height={20} width="60%" />
        </Stack>
      </Stack>
    );
  }

  if (!packageStats) {
    return (
      <Stack gap="md" align="center">
        <Text c="dimmed" size="sm" ta="center">
          Enter a package name to see metrics
        </Text>
      </Stack>
    );
  }

  const isQualityWinner = winnerMetrics.quality;
  const isPopularityWinner = winnerMetrics.popularity;
  const isMaintenanceWinner = winnerMetrics.maintenance;
  const isDownloadsWinner = winnerMetrics.weeklyDownloads;
  const isStarsWinner = winnerMetrics.stars;
  const isForksWinner = winnerMetrics.forks;
  const isDependentsWinner = winnerMetrics.dependentsCount;

  const hasKeywords = (packageStats.npm?.keywords.length ?? 0) > 0;
  const hasLinks = packageStats.links;
  const hasEvaluation = packageStats.evaluation;

  return (
    <Stack gap="md">
      {/* Header with version and language */}
      <Box>
        <Text size="sm" c="dimmed" lineClamp={2} mb="xs">
          {packageStats.description || "No description available"}
        </Text>
        <Group gap="xs">
          <Badge variant="outline" size="sm">
            v{packageStats.version}
          </Badge>
          {packageStats.github?.language && (
            <Badge
              variant="light"
              size="sm"
              leftSection={<IconCode size={10} />}
            >
              {packageStats.github.language}
            </Badge>
          )}
        </Group>
      </Box>

      {/* Links Row */}
      {hasLinks && (
        <Group gap="xs">
          {packageStats.links?.pypi && (
            <Anchor href={packageStats.links.pypi} target="_blank" size="xs">
              <Group gap={2}>
                PyPI <IconExternalLink size={10} />
              </Group>
            </Anchor>
          )}
          {packageStats.links?.npm && (
            <Anchor href={packageStats.links.npm} target="_blank" size="xs">
              <Group gap={2}>
                npm <IconExternalLink size={10} />
              </Group>
            </Anchor>
          )}
          {packageStats.links?.repository && (
            <Anchor
              href={packageStats.links.repository}
              target="_blank"
              size="xs"
            >
              <Group gap={2}>
                Repository <IconExternalLink size={10} />
              </Group>
            </Anchor>
          )}
          {packageStats.links?.homepage && (
            <Anchor
              href={packageStats.links.homepage}
              target="_blank"
              size="xs"
            >
              <Group gap={2}>
                Homepage <IconExternalLink size={10} />
              </Group>
            </Anchor>
          )}
          {packageStats.links?.bugs && (
            <Anchor href={packageStats.links.bugs} target="_blank" size="xs">
              <Group gap={2}>
                Issues <IconExternalLink size={10} />
              </Group>
            </Anchor>
          )}
        </Group>
      )}

      {/* ===== PyPI Registry Data Section ===== */}
      {packageStats.pypi && (
        <>
          <Box>
            <Group gap="xs" mb="xs">
              <Text size="sm" fw={600}>
                PyPI Registry
              </Text>
            </Group>
            <Stack gap="xs">
              <MetricRow
                label="Requires Python"
                value={packageStats.pypi.requiresPython ?? "Any"}
              />
              <MetricRow
                label="License"
                value={packageStats.pypi.license ?? "Not specified"}
              />
              <MetricRow
                label="Dependencies"
                value={String(packageStats.pypi.dependencies.length)}
              />
              <MetricRow
                label="Total Uploads"
                value={String(packageStats.pypi.uploads)}
              />
              {packageStats.pypi.upload_time && (
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Last Upload
                  </Text>
                  <Tooltip label={formatDate(packageStats.pypi.upload_time)}>
                    <Text size="sm">
                      {formatRelativeDate(packageStats.pypi.upload_time)}
                    </Text>
                  </Tooltip>
                </Group>
              )}

              {/* Author */}
              {packageStats.author && (
                <MetricRow label="Author" value={packageStats.author.name} />
              )}

              {/* Classifiers */}
              {packageStats.pypi.classifiers &&
                packageStats.pypi.classifiers.length > 0 && (
                  <Box>
                    <Text size="xs" c="dimmed" mb={4}>
                      Classifiers ({packageStats.pypi.classifiers.length})
                    </Text>
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
                  </Box>
                )}
            </Stack>
          </Box>
          <Divider />
        </>
      )}

      {/* ===== npms.io Derived Scores Section (npm only) ===== */}
      {packageStats.evaluation && (
        <Box>
          <Group gap="xs" mb="xs">
            <IconCalculator size={18} color="var(--mantine-color-violet-6)" />
            <Text size="sm" fw={600}>
              npms.io Scores
            </Text>
            <Tooltip
              label="Normalized 0-100 scores calculated by npms.io. These enable comparison across packages."
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

          <Stack gap="md">
            {/* Overall Score */}
            <Group justify="space-between">
              <Group gap={4}>
                <Text size="xs" c="dimmed">
                  Overall Score
                </Text>
                <Tooltip
                  label={CALCULATION_TOOLTIPS.finalScore}
                  multiline
                  w={250}
                >
                  <IconInfoCircle
                    size={12}
                    color="var(--mantine-color-dimmed)"
                    style={{ cursor: "help" }}
                  />
                </Tooltip>
              </Group>
              <Badge
                color={getScoreColor(packageStats.finalScore)}
                variant="filled"
                size="lg"
              >
                {packageStats.finalScore ?? "N/A"}/100
              </Badge>
            </Group>

            {/* Main Score Badges */}
            <Group gap="xs" wrap="wrap">
              <Tooltip label={CALCULATION_TOOLTIPS.quality} multiline w={250}>
                <Badge
                  size="sm"
                  color={getScoreColor(packageStats.quality)}
                  style={{ cursor: "help" }}
                >
                  Quality: {packageStats.quality ?? "N/A"}
                </Badge>
              </Tooltip>

              <Tooltip label={CALCULATION_TOOLTIPS.popularity} multiline w={250}>
                <Badge
                  size="sm"
                  color={getScoreColor(packageStats.popularity)}
                  style={{ cursor: "help" }}
                >
                  Popularity: {packageStats.popularity ?? "N/A"}
                </Badge>
              </Tooltip>

              <Tooltip label={CALCULATION_TOOLTIPS.maintenance} multiline w={250}>
                <Badge
                  size="sm"
                  color={getScoreColor(packageStats.maintenance)}
                  style={{ cursor: "help" }}
                >
                  Maintenance: {packageStats.maintenance ?? "N/A"}
                </Badge>
              </Tooltip>
            </Group>

            {/* Detailed Breakdowns - all derived 0-100 scores */}
            {hasEvaluation && (
              <Stack gap="md">
                {/* Quality Breakdown */}
                {packageStats.evaluation?.quality && (
                  <Box>
                    <Text size="xs" fw={500} mb={4}>
                      Quality Breakdown
                    </Text>
                    <Stack gap={2}>
                      <MetricRow
                        label="Tests"
                        value={`${String(packageStats.evaluation.quality.tests)}%`}
                        tooltip={CALCULATION_TOOLTIPS.tests}
                        isBadge
                      />
                      <MetricRow
                        label="Health"
                        value={`${String(packageStats.evaluation.quality.health)}%`}
                        tooltip={CALCULATION_TOOLTIPS.health}
                        isBadge
                      />
                      <MetricRow
                        label="Carefulness"
                        value={`${String(packageStats.evaluation.quality.carefulness)}%`}
                        tooltip={CALCULATION_TOOLTIPS.carefulness}
                        isBadge
                      />
                      <MetricRow
                        label="Branding"
                        value={`${String(packageStats.evaluation.quality.branding)}%`}
                        tooltip={CALCULATION_TOOLTIPS.branding}
                        isBadge
                      />
                    </Stack>
                  </Box>
                )}

                {/* Maintenance Breakdown */}
                {packageStats.evaluation?.maintenance && (
                  <Box>
                    <Text size="xs" fw={500} mb={4}>
                      Maintenance Breakdown
                    </Text>
                    <Stack gap={2}>
                      <MetricRow
                        label="Release Frequency"
                        value={`${String(packageStats.evaluation.maintenance.releasesFrequency)}%`}
                        tooltip={CALCULATION_TOOLTIPS.releasesFrequency}
                        isBadge
                      />
                      <MetricRow
                        label="Commit Frequency"
                        value={`${String(packageStats.evaluation.maintenance.commitsFrequency)}%`}
                        tooltip={CALCULATION_TOOLTIPS.commitsFrequency}
                        isBadge
                      />
                      <MetricRow
                        label="Open Issues"
                        value={`${String(packageStats.evaluation.maintenance.openIssues)}%`}
                        tooltip={CALCULATION_TOOLTIPS.openIssues}
                        isBadge
                      />
                      <MetricRow
                        label="Issues Distribution"
                        value={`${String(packageStats.evaluation.maintenance.issuesDistribution)}%`}
                        tooltip={CALCULATION_TOOLTIPS.issuesDistribution}
                        isBadge
                      />
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}
          </Stack>
        </Box>
      )}

      {/* ===== Comparison Analysis Section (Our Calculations) ===== */}
      {(isQualityWinner ||
        isPopularityWinner ||
        isMaintenanceWinner ||
        isDownloadsWinner ||
        isStarsWinner ||
        isForksWinner ||
        isDependentsWinner) && (
        <>
          <Divider />
          <Box>
            <Group gap="xs" mb="xs">
              <IconTrophy size={18} color="var(--mantine-color-orange-6)" />
              <Text size="sm" fw={600}>
                Comparison Results
              </Text>
              <Tooltip
                label="Metrics where this package leads compared to others in your comparison."
                multiline
                w={250}
              >
                <IconInfoCircle
                  size={14}
                  color="var(--mantine-color-dimmed)"
                  style={{ cursor: "help" }}
                />
              </Tooltip>
            </Group>
            <Group gap="xs" wrap="wrap">
              {isDownloadsWinner && (
                <Badge size="sm" color="orange" variant="light">
                  Most Downloads
                </Badge>
              )}
              {isStarsWinner && (
                <Badge size="sm" color="orange" variant="light">
                  Most Stars
                </Badge>
              )}
              {isForksWinner && (
                <Badge size="sm" color="orange" variant="light">
                  Most Forks
                </Badge>
              )}
              {isDependentsWinner && (
                <Badge size="sm" color="orange" variant="light">
                  Most Dependents
                </Badge>
              )}
              {isQualityWinner && (
                <Badge size="sm" color="orange" variant="light">
                  Highest Quality
                </Badge>
              )}
              {isPopularityWinner && (
                <Badge size="sm" color="orange" variant="light">
                  Most Popular
                </Badge>
              )}
              {isMaintenanceWinner && (
                <Badge size="sm" color="orange" variant="light">
                  Best Maintained
                </Badge>
              )}
            </Group>
          </Box>
        </>
      )}

      {/* ===== npm Registry Data Section ===== */}
      {packageStats.npm && (
        <>
          <Divider />
          <Box>
        <Group justify="space-between" mb="xs">
          <Group gap="xs">
            <IconBrandNpm size={18} color="var(--mantine-color-red-6)" />
            <Text size="sm" fw={600}>
              npm Registry
            </Text>
          </Group>
          {onRefreshNpm && (
            <Tooltip label="Refresh npm data">
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                loading={isRefetchingNpm}
                onClick={onRefreshNpm}
                aria-label="Refresh npm data"
              >
                <IconRefresh size={14} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
        <Stack gap="xs">
          <MetricRow
            label="Weekly Downloads"
            value={formatNumber(packageStats.weeklyDownloads)}
          />
          <MetricRow
            label="Dependents"
            value={formatNumber(packageStats.dependentsCount)}
            tooltip="Packages that depend on this package"
          />
          <MetricRow
            label="License"
            value={packageStats.npm?.license ?? "N/A"}
          />
          <MetricRow
            label="Dependencies"
            value={String(packageStats.npm?.dependencies.length ?? 0)}
          />
          {(packageStats.npm?.devDependencies.length ?? 0) > 0 && (
            <MetricRow
              label="Dev Dependencies"
              value={String(packageStats.npm?.devDependencies.length ?? 0)}
            />
          )}
          {(packageStats.npm
            ? Object.keys(packageStats.npm.peerDependencies).length
            : 0) > 0 && (
            <MetricRow
              label="Peer Dependencies"
              value={String(
                packageStats.npm
                  ? Object.keys(packageStats.npm.peerDependencies).length
                  : 0,
              )}
            />
          )}

          {/* Keywords */}
          {hasKeywords && (
            <Box>
              <Text size="xs" c="dimmed" mb={4}>
                Keywords
              </Text>
              <Group gap={4}>
                {packageStats.npm?.keywords.slice(0, 5).map((kw) => (
                  <Badge key={kw} size="xs" variant="outline">
                    {kw}
                  </Badge>
                ))}
                {(packageStats.npm?.keywords.length ?? 0) > 5 && (
                  <Badge size="xs" variant="light">
                    +{String((packageStats.npm?.keywords.length ?? 0) - 5)} more
                  </Badge>
                )}
              </Group>
            </Box>
          )}

          {/* Author */}
          {packageStats.author && (
            <MetricRow label="Author" value={packageStats.author.name} />
          )}

          {/* Maintainers */}
          {packageStats.maintainers && packageStats.maintainers.length > 0 && (
            <Box>
              <Group justify="space-between" mb={4}>
                <Text size="xs" c="dimmed">
                  Maintainers ({packageStats.maintainers.length})
                </Text>
                {(hasOverflow || maintainersExpanded) && (
                  <UnstyledButton
                    onClick={() => {
                      setMaintainersExpanded(!maintainersExpanded);
                    }}
                  >
                    <Group gap={2}>
                      <Text size="xs" c="blue">
                        {maintainersExpanded ? "Show less" : "Show all"}
                      </Text>
                      {maintainersExpanded ? (
                        <IconChevronUp
                          size={14}
                          color="var(--mantine-color-blue-6)"
                        />
                      ) : (
                        <IconChevronDown
                          size={14}
                          color="var(--mantine-color-blue-6)"
                        />
                      )}
                    </Group>
                  </UnstyledButton>
                )}
              </Group>
              <Box
                ref={maintainersRef}
                style={{
                  overflow: "hidden",
                  maxHeight: maintainersExpanded ? "500px" : "32px",
                  transition: "max-height 200ms ease-in-out",
                }}
              >
                <Group gap="xs" wrap="wrap">
                  {packageStats.maintainers.map((m) => (
                    <Tooltip key={m.name} label={m.name}>
                      <Avatar
                        src={getGravatarUrl(m.email, 32)}
                        size="sm"
                        radius="xl"
                        alt={m.name}
                      />
                    </Tooltip>
                  ))}
                </Group>
              </Box>
            </Box>
          )}
        </Stack>
      </Box>
    </>
  )}

      {/* ===== GitHub Data Section ===== */}
      <Box>
        <Group justify="space-between" mb="xs">
          <Group gap="xs">
            <IconBrandGithub size={18} />
            <Text size="sm" fw={600}>
              GitHub
            </Text>
          </Group>
          {onRefreshGithub && (
            <Tooltip label="Refresh GitHub data">
              <ActionIcon
                variant="subtle"
                size="sm"
                loading={isRefetchingGithub}
                onClick={onRefreshGithub}
                aria-label="Refresh GitHub data"
              >
                <IconRefresh size={14} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
        <Stack gap="xs">
          <MetricRow label="Stars" value={formatNumber(packageStats.stars)} />
          <MetricRow label="Forks" value={formatNumber(packageStats.forks)} />
          <MetricRow
            label="Open Issues"
            value={formatNumber(packageStats.openIssues)}
          />
          {packageStats.github && (
            <MetricRow
              label="Watchers"
              value={formatNumber(packageStats.github.subscribers)}
            />
          )}
          {packageStats.github?.pushedAt && (
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Last Push
              </Text>
              <Tooltip label={formatDate(packageStats.github.pushedAt)}>
                <Text size="sm">
                  {formatRelativeDate(packageStats.github.pushedAt)}
                </Text>
              </Tooltip>
            </Group>
          )}
          {packageStats.github?.createdAt && (
            <MetricRow
              label="Created"
              value={formatDate(packageStats.github.createdAt)}
            />
          )}
          {packageStats.github?.updatedAt && (
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Last Updated
              </Text>
              <Tooltip label={formatDate(packageStats.github.updatedAt)}>
                <Text size="sm">
                  {formatRelativeDate(packageStats.github.updatedAt)}
                </Text>
              </Tooltip>
            </Group>
          )}
          {packageStats.github?.size !== undefined &&
            packageStats.github.size > 0 && (
              <MetricRow
                label="Repo Size"
                value={formatSize(packageStats.github.size)}
              />
            )}
          {packageStats.github?.defaultBranch && (
            <MetricRow
              label="Default Branch"
              value={packageStats.github.defaultBranch}
            />
          )}

          {/* Contributors - now in GitHub section */}
          {packageStats.contributors &&
            packageStats.contributors.length > 0 && (
              <Box>
                <Group justify="space-between" mb={4}>
                  <Text size="xs" c="dimmed">
                    Top Contributors ({String(packageStats.contributors.length)}
                    )
                  </Text>
                  {(hasContributorOverflow || contributorsExpanded) && (
                    <UnstyledButton
                      onClick={() => {
                        setContributorsExpanded(!contributorsExpanded);
                      }}
                    >
                      <Group gap={2}>
                        <Text size="xs" c="blue">
                          {contributorsExpanded ? "Show less" : "Show all"}
                        </Text>
                        {contributorsExpanded ? (
                          <IconChevronUp
                            size={14}
                            color="var(--mantine-color-blue-6)"
                          />
                        ) : (
                          <IconChevronDown
                            size={14}
                            color="var(--mantine-color-blue-6)"
                          />
                        )}
                      </Group>
                    </UnstyledButton>
                  )}
                </Group>
                <Box
                  ref={contributorsRef}
                  style={{
                    overflow: "hidden",
                    maxHeight: contributorsExpanded ? "500px" : "32px",
                    transition: "max-height 200ms ease-in-out",
                  }}
                >
                  <Group gap="xs" wrap="wrap">
                    {packageStats.contributors.map((c) => (
                      <Tooltip
                        key={c.username}
                        label={`${c.username} (${String(c.commitsCount)} commits)`}
                      >
                        <Anchor
                          href={`https://github.com/${c.username}`}
                          target="_blank"
                        >
                          <Avatar
                            src={`https://github.com/${c.username}.png?size=32`}
                            size="sm"
                            radius="xl"
                            alt={c.username}
                          />
                        </Anchor>
                      </Tooltip>
                    ))}
                  </Group>
                </Box>
              </Box>
            )}
        </Stack>
      </Box>
    </Stack>
  );
}

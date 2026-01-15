import { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  Card,
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
  IconChevronDown,
  IconChevronUp,
  IconCode,
  IconExternalLink,
  IconRefresh,
  IconTrophy,
  IconUser,
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
  const [hasOverflow, setHasOverflow] = useState(false);
  const maintainersRef = useRef<HTMLDivElement>(null);

  // Detect if maintainers overflow the container
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is painted before measuring
    const checkOverflow = () => {
      const el = maintainersRef.current;
      if (el && !maintainersExpanded) {
        // Add 1px buffer for sub-pixel rendering differences
        setHasOverflow(el.scrollHeight > el.clientHeight + 1);
      }
    };
    const frameId = requestAnimationFrame(checkOverflow);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [packageStats?.maintainers, maintainersExpanded]);

  if (isLoading) {
    return (
      <Card shadow="sm" padding="lg" withBorder>
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
      </Card>
    );
  }

  if (!packageStats) {
    return (
      <Card shadow="sm" padding="lg" withBorder opacity={0.5}>
        <Stack gap="md" align="center">
          <Text c="dimmed" size="sm" ta="center">
            Enter a package name to see metrics
          </Text>
        </Stack>
      </Card>
    );
  }

  const isQualityWinner = winnerMetrics.quality;
  const isPopularityWinner = winnerMetrics.popularity;
  const isMaintenanceWinner = winnerMetrics.maintenance;
  const isDownloadsWinner = winnerMetrics.weeklyDownloads;
  const isStarsWinner = winnerMetrics.stars;
  const isForksWinner = winnerMetrics.forks;
  const isDependentsWinner = winnerMetrics.dependentsCount;

  const hasAuthorOrMaintainers =
    packageStats.author || (packageStats.maintainers?.length ?? 0) > 0;
  const hasKeywords = (packageStats.npm?.keywords.length ?? 0) > 0;
  const hasLinks = packageStats.links;
  const hasEvaluation = packageStats.evaluation;

  return (
    <Card shadow="sm" padding="lg" withBorder>
      <Stack gap="md">
        {/* Header with version and final score */}
        <Group justify="space-between" align="flex-start">
          <Stack gap={2}>
            <Text size="sm" c="dimmed" lineClamp={2}>
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
          </Stack>
          <Tooltip label="Overall npms.io score">
            <Badge
              color={getScoreColor(packageStats.finalScore)}
              variant="filled"
              size="lg"
            >
              {packageStats.finalScore ?? "N/A"}/100
            </Badge>
          </Tooltip>
        </Group>

        <Divider />

        {/* npm Data Section */}
        <Box>
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <IconBrandNpm size={18} color="var(--mantine-color-red-6)" />
              <Text size="sm" fw={600}>
                npm
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
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Weekly Downloads
              </Text>
              <Group gap={4}>
                {isDownloadsWinner && <IconTrophy size={12} color="orange" />}
                <Text size="sm" fw={isDownloadsWinner ? 700 : 400}>
                  {formatNumber(packageStats.weeklyDownloads)}
                </Text>
              </Group>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Dependents
              </Text>
              <Group gap={4}>
                {isDependentsWinner && <IconTrophy size={12} color="orange" />}
                <Text size="sm" fw={isDependentsWinner ? 700 : 400}>
                  {formatNumber(packageStats.dependentsCount)}
                </Text>
              </Group>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                License
              </Text>
              <Text size="sm">{packageStats.npm?.license ?? "N/A"}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Dependencies
              </Text>
              <Text size="sm">
                {packageStats.npm?.dependencies.length ?? 0}
              </Text>
            </Group>
            {(packageStats.npm?.devDependencies.length ?? 0) > 0 && (
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  Dev Dependencies
                </Text>
                <Text size="sm">
                  {packageStats.npm?.devDependencies.length ?? 0}
                </Text>
              </Group>
            )}
            {(packageStats.npm
              ? Object.keys(packageStats.npm.peerDependencies).length
              : 0) > 0 && (
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  Peer Dependencies
                </Text>
                <Text size="sm">
                  {packageStats.npm
                    ? Object.keys(packageStats.npm.peerDependencies).length
                    : 0}
                </Text>
              </Group>
            )}
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
                      +{String((packageStats.npm?.keywords.length ?? 0) - 5)}{" "}
                      more
                    </Badge>
                  )}
                </Group>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Score Badges */}
        <Group gap="xs" wrap="wrap">
          <Text size="xs" c="dimmed">
            Quality:
          </Text>
          <Badge
            size="xs"
            color={getScoreColor(packageStats.quality)}
            leftSection={isQualityWinner ? <IconTrophy size={10} /> : undefined}
          >
            {packageStats.quality ?? "N/A"}
          </Badge>

          <Text size="xs" c="dimmed">
            Popularity:
          </Text>
          <Badge
            size="xs"
            color={getScoreColor(packageStats.popularity)}
            leftSection={
              isPopularityWinner ? <IconTrophy size={10} /> : undefined
            }
          >
            {packageStats.popularity ?? "N/A"}
          </Badge>

          <Text size="xs" c="dimmed">
            Maintenance:
          </Text>
          <Badge
            size="xs"
            color={getScoreColor(packageStats.maintenance)}
            leftSection={
              isMaintenanceWinner ? <IconTrophy size={10} /> : undefined
            }
          >
            {packageStats.maintenance ?? "N/A"}
          </Badge>
        </Group>

        <Divider />

        {/* GitHub Data Section */}
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
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Stars
              </Text>
              <Group gap={4}>
                {isStarsWinner && <IconTrophy size={12} color="orange" />}
                <Text size="sm" fw={isStarsWinner ? 700 : 400}>
                  {formatNumber(packageStats.stars)}
                </Text>
              </Group>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Forks
              </Text>
              <Group gap={4}>
                {isForksWinner && <IconTrophy size={12} color="orange" />}
                <Text size="sm" fw={isForksWinner ? 700 : 400}>
                  {formatNumber(packageStats.forks)}
                </Text>
              </Group>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Open Issues
              </Text>
              <Text size="sm">{formatNumber(packageStats.openIssues)}</Text>
            </Group>
            {packageStats.github && (
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  Watchers
                </Text>
                <Text size="sm">
                  {formatNumber(packageStats.github.subscribers)}
                </Text>
              </Group>
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
            {packageStats.github?.size !== undefined &&
              packageStats.github.size > 0 && (
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Repo Size
                  </Text>
                  <Text size="sm">{formatSize(packageStats.github.size)}</Text>
                </Group>
              )}
            {packageStats.github?.createdAt && (
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  Created
                </Text>
                <Text size="sm">
                  {formatDate(packageStats.github.createdAt)}
                </Text>
              </Group>
            )}
          </Stack>
        </Box>

        {/* Package Info Section */}
        {(hasAuthorOrMaintainers || hasLinks) && (
          <>
            <Divider />
            <Box>
              <Group gap="xs" mb="xs">
                <IconUser size={18} />
                <Text size="sm" fw={600}>
                  Package Info
                </Text>
              </Group>
              <Stack gap="xs">
                {/* Author */}
                {packageStats.author && (
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Author
                    </Text>
                    <Text size="sm">{packageStats.author.name}</Text>
                  </Group>
                )}

                {/* Maintainers */}
                {packageStats.maintainers &&
                  packageStats.maintainers.length > 0 && (
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

                {/* Links */}
                {hasLinks && (
                  <Box>
                    <Text size="xs" c="dimmed" mb={4}>
                      Links
                    </Text>
                    <Group gap="xs">
                      {packageStats.links?.npm && (
                        <Anchor
                          href={packageStats.links.npm}
                          target="_blank"
                          size="xs"
                        >
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
                        <Anchor
                          href={packageStats.links.bugs}
                          target="_blank"
                          size="xs"
                        >
                          <Group gap={2}>
                            Issues <IconExternalLink size={10} />
                          </Group>
                        </Anchor>
                      )}
                    </Group>
                  </Box>
                )}
              </Stack>
            </Box>
          </>
        )}

        {/* Detailed Scores Section */}
        {hasEvaluation && (
          <>
            <Divider />
            <Box>
              <Group gap="xs" mb="xs">
                <IconTrophy size={18} />
                <Text size="sm" fw={600}>
                  Detailed Scores
                </Text>
              </Group>
              <Stack gap="md">
                {/* Quality Breakdown */}
                {packageStats.evaluation?.quality && (
                  <Box>
                    <Text size="xs" fw={500} mb={4}>
                      Quality
                    </Text>
                    <Stack gap={2}>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Tests
                        </Text>
                        <Badge size="xs" variant="light">
                          {packageStats.evaluation.quality.tests}%
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Health
                        </Text>
                        <Badge size="xs" variant="light">
                          {packageStats.evaluation.quality.health}%
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Carefulness
                        </Text>
                        <Badge size="xs" variant="light">
                          {packageStats.evaluation.quality.carefulness}%
                        </Badge>
                      </Group>
                    </Stack>
                  </Box>
                )}

                {/* Popularity Breakdown - these are raw metrics, not scores */}
                {packageStats.evaluation?.popularity && (
                  <Box>
                    <Text size="xs" fw={500} mb={4}>
                      Popularity
                    </Text>
                    <Stack gap={2}>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Community Interest
                        </Text>
                        <Badge size="xs" variant="light">
                          {packageStats.evaluation.popularity.communityInterest.toLocaleString()}
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Downloads Count
                        </Text>
                        <Badge size="xs" variant="light">
                          {formatNumber(
                            packageStats.evaluation.popularity.downloadsCount,
                          )}
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Downloads Trend
                        </Text>
                        <Badge
                          size="xs"
                          variant="light"
                          color={
                            packageStats.evaluation.popularity
                              .downloadsAcceleration >= 0
                              ? "green"
                              : "red"
                          }
                        >
                          {packageStats.evaluation.popularity
                            .downloadsAcceleration >= 0
                            ? "+"
                            : ""}
                          {formatNumber(
                            packageStats.evaluation.popularity
                              .downloadsAcceleration,
                          )}
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Dependents Count
                        </Text>
                        <Badge size="xs" variant="light">
                          {packageStats.evaluation.popularity.dependentsCount.toLocaleString()}
                        </Badge>
                      </Group>
                    </Stack>
                  </Box>
                )}

                {/* Maintenance Breakdown */}
                {packageStats.evaluation?.maintenance && (
                  <Box>
                    <Text size="xs" fw={500} mb={4}>
                      Maintenance
                    </Text>
                    <Stack gap={2}>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Release Frequency
                        </Text>
                        <Badge size="xs" variant="light">
                          {
                            packageStats.evaluation.maintenance
                              .releasesFrequency
                          }
                          %
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Commit Frequency
                        </Text>
                        <Badge size="xs" variant="light">
                          {packageStats.evaluation.maintenance.commitsFrequency}
                          %
                        </Badge>
                      </Group>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Box>
          </>
        )}
      </Stack>
    </Card>
  );
}

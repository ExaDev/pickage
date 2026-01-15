import {
  ActionIcon,
  Badge,
  Group,
  Paper,
  ScrollArea,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconRefresh, IconTrophy, IconX } from "@tabler/icons-react";
import type { ViewProps } from "./types";

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
 * Get badge color based on score value
 */
function getScoreColor(score: number | undefined): string {
  if (score === undefined) return "gray";
  if (score >= 80) return "green";
  if (score >= 60) return "yellow";
  return "red";
}

/**
 * Metric row definitions
 */
interface MetricDef {
  key: string;
  label: string;
  format: (v: number | undefined) => string;
  isScore?: boolean;
}

const METRICS: MetricDef[] = [
  { key: "weeklyDownloads", label: "Weekly Downloads", format: formatNumber },
  { key: "stars", label: "GitHub Stars", format: formatNumber },
  { key: "forks", label: "Forks", format: formatNumber },
  {
    key: "quality",
    label: "Quality Score",
    format: (v: number | undefined) =>
      v !== undefined ? `${String(v)}%` : "N/A",
    isScore: true,
  },
  {
    key: "popularity",
    label: "Popularity Score",
    format: (v: number | undefined) =>
      v !== undefined ? `${String(v)}%` : "N/A",
    isScore: true,
  },
  {
    key: "maintenance",
    label: "Maintenance Score",
    format: (v: number | undefined) =>
      v !== undefined ? `${String(v)}%` : "N/A",
    isScore: true,
  },
];

/**
 * Table view - metrics comparison table
 * Rows = metrics, Columns = packages
 * Most compact for pure metric comparison
 */
export function TableView({
  packages,
  packagesData,
  isLoading,
  winnerMetrics,
  canRemove,
  onRemove,
  refetchingPackages,
  onRefresh,
}: ViewProps) {
  if (isLoading) {
    return (
      <Paper p="xl" radius="md" withBorder>
        <Text c="dimmed" ta="center">
          Loading package data...
        </Text>
      </Paper>
    );
  }

  return (
    <Paper radius="md" withBorder>
      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ minWidth: 150 }}>Metric</Table.Th>
              {packages.map((pkg) => (
                <Table.Th key={pkg.id} style={{ minWidth: 150 }}>
                  <Group gap="xs" justify="space-between" wrap="nowrap">
                    <Text fw={600} truncate>
                      {pkg.packageName}
                    </Text>
                    <Group gap={4}>
                      <Tooltip label="Refresh data">
                        <ActionIcon
                          color="blue"
                          variant="subtle"
                          size="xs"
                          loading={refetchingPackages[pkg.packageName]}
                          onClick={() => {
                            onRefresh(pkg.packageName);
                          }}
                          aria-label={`Refresh ${pkg.packageName} data`}
                        >
                          <IconRefresh size={14} />
                        </ActionIcon>
                      </Tooltip>
                      {canRemove && (
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          size="xs"
                          onClick={() => {
                            onRemove(pkg.id);
                          }}
                          aria-label={`Remove ${pkg.packageName}`}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Group>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {METRICS.map((metric) => (
              <Table.Tr key={metric.key}>
                <Table.Td>
                  <Text fw={500}>{metric.label}</Text>
                </Table.Td>
                {packages.map((pkg) => {
                  const stats = packagesData.find(
                    (p) => p.name === pkg.packageName,
                  );
                  const value = stats?.[metric.key as keyof typeof stats] as
                    | number
                    | undefined;
                  const pkgWinners = winnerMetrics[pkg.packageName];
                  const isWinner = pkgWinners[metric.key];

                  return (
                    <Table.Td key={pkg.id}>
                      <Group gap="xs" wrap="nowrap">
                        {metric.isScore ? (
                          <Badge
                            color={getScoreColor(value)}
                            variant="light"
                            size="lg"
                          >
                            {metric.format(value)}
                          </Badge>
                        ) : (
                          <Text>{metric.format(value)}</Text>
                        )}
                        {isWinner && packages.length > 1 && (
                          <Tooltip label="Best in category">
                            <IconTrophy
                              size={16}
                              style={{ color: "var(--mantine-color-orange-6)" }}
                            />
                          </Tooltip>
                        )}
                      </Group>
                    </Table.Td>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}

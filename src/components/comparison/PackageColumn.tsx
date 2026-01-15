import { ActionIcon, Box, Group, Paper, Title, Tooltip } from "@mantine/core";
import { IconRefresh, IconX } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { PackageStats } from "@/types/adapter";
import { PackageMetricsPanel } from "./PackageMetricsPanel";

interface PackageColumnProps {
  packageName: string;
  packageStats: PackageStats | null;
  isLoading: boolean;
  isRefetching?: boolean;
  showRemove: boolean;
  winnerMetrics?: {
    [key in keyof PackageStats]?: boolean;
  };
  onRemove: () => void;
  onRefresh?: () => void;
}

export function PackageColumn({
  packageName,
  packageStats,
  isLoading,
  isRefetching = false,
  showRemove,
  winnerMetrics = {},
  onRemove,
  onRefresh,
}: PackageColumnProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        height: "100%",
      }}
    >
      {/* Package Header with Refresh and Remove Buttons */}
      <Paper p="sm" radius="md" withBorder>
        <Group justify="space-between" wrap="nowrap">
          <Title order={4}>{packageName}</Title>
          <Group gap="xs">
            {onRefresh && (
              <Tooltip label="Refresh data">
                <ActionIcon
                  color="blue"
                  variant="subtle"
                  onClick={onRefresh}
                  size="sm"
                  loading={isRefetching}
                  aria-label={`Refresh ${packageName} data`}
                >
                  <IconRefresh size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            {showRemove && (
              <ActionIcon
                color="red"
                variant="subtle"
                onClick={onRemove}
                size="sm"
                aria-label={`Remove ${packageName}`}
              >
                <IconX size={16} />
              </ActionIcon>
            )}
          </Group>
        </Group>
      </Paper>

      {/* Metrics Panel */}
      <PackageMetricsPanel
        packageStats={packageStats}
        isLoading={isLoading}
        winnerMetrics={winnerMetrics}
      />

      {/* README Section */}
      {packageStats?.github?.readme && (
        <Paper p="md" radius="md" withBorder>
          <Title order={5} mb="md">
            README
          </Title>
          <Box
            style={{
              maxHeight: "500px",
              overflow: "auto",
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
            >
              {packageStats.github.readme}
            </ReactMarkdown>
          </Box>
        </Paper>
      )}
    </div>
  );
}

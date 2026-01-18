import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Group,
  Skeleton,
  Text,
} from "@mantine/core";
import { IconCode, IconExternalLink, IconX } from "@tabler/icons-react";
import type { PackageStats } from "@/types/adapter";

interface HeaderSectionProps {
  packageName: string;
  packageStats: PackageStats | null;
  isLoading: boolean;
  showRemove: boolean;
  onRemove: () => void;
  rowCount: number;
}

export function HeaderSection({
  packageName,
  packageStats,
  isLoading,
  showRemove,
  onRemove,
  rowCount,
}: HeaderSectionProps) {
  const bgStyle = {
    backgroundColor: "var(--mantine-primary-color-light)",
    paddingLeft: "var(--mantine-spacing-lg)",
    paddingRight: "var(--mantine-spacing-lg)",
  };

  if (isLoading) {
    return (
      <Box
        style={{
          display: "grid",
          gridTemplateRows: "subgrid",
          gridRow: `span ${String(rowCount)}`,
        }}
      >
        <Box py="sm" style={bgStyle}>
          <Skeleton height={24} width="60%" />
        </Box>
        <Box py="xs" style={bgStyle}>
          <Skeleton height={16} width="100%" />
        </Box>
        <Box py="xs" style={bgStyle}>
          <Skeleton height={20} width="40%" />
        </Box>
        <Box
          py="xs"
          style={{
            ...bgStyle,
            borderBottom: "1px solid var(--mantine-color-default-border)",
          }}
        >
          <Skeleton height={16} width="60%" />
        </Box>
      </Box>
    );
  }

  const links = packageStats?.links;

  return (
    <Box
      style={{
        display: "grid",
        gridTemplateRows: "subgrid",
        gridRow: `span ${String(rowCount)}`,
      }}
    >
      {/* Row 1: Package name + remove button */}
      <Box py="sm" style={bgStyle}>
        <Group justify="space-between" wrap="nowrap">
          <Text fw={700} size="lg">
            {packageName}
          </Text>
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
      </Box>

      {/* Row 2: Description */}
      <Box py="xs" style={bgStyle}>
        <Text size="sm" c="dimmed" lineClamp={2}>
          {packageStats?.description || "No description available"}
        </Text>
      </Box>

      {/* Row 3: Version + language badges */}
      <Box py="xs" style={bgStyle}>
        <Group gap="xs">
          {packageStats && (
            <Badge variant="outline" size="sm">
              v{packageStats.version}
            </Badge>
          )}
          {packageStats?.github?.language && (
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

      {/* Row 4: Links */}
      <Box
        py="xs"
        style={{
          ...bgStyle,
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        {links ? (
          <Group gap="xs">
            {links.npm && (
              <Anchor href={links.npm} target="_blank" size="xs">
                <Group gap={2}>
                  npm <IconExternalLink size={10} />
                </Group>
              </Anchor>
            )}
            {links.repository && (
              <Anchor href={links.repository} target="_blank" size="xs">
                <Group gap={2}>
                  Repository <IconExternalLink size={10} />
                </Group>
              </Anchor>
            )}
            {links.homepage && (
              <Anchor href={links.homepage} target="_blank" size="xs">
                <Group gap={2}>
                  Homepage <IconExternalLink size={10} />
                </Group>
              </Anchor>
            )}
            {links.bugs && (
              <Anchor href={links.bugs} target="_blank" size="xs">
                <Group gap={2}>
                  Issues <IconExternalLink size={10} />
                </Group>
              </Anchor>
            )}
          </Group>
        ) : (
          <Text size="xs" c="dimmed">
            &nbsp;
          </Text>
        )}
      </Box>
    </Box>
  );
}

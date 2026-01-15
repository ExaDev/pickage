import {
  Badge,
  Card,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import type { PackageStats } from "@/types/adapter";

interface PackageCardsProps {
  packages: PackageStats[];
}

function formatNumber(value: number | undefined): string {
  if (value === undefined) return "N/A";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

function getScoreColor(score: number | undefined): "green" | "yellow" | "red" {
  if (score === undefined) return "red";
  if (score > 80) return "green";
  if (score > 60) return "yellow";
  return "red";
}

export function PackageCards({ packages }: PackageCardsProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
      {packages.map((pkg) => (
        <Card
          key={pkg.name}
          shadow="sm"
          padding="lg"
          withBorder
          style={{
            transition: "all 0.2s ease",
            cursor: "default",
          }}
          styles={{
            root: {
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                transform: "translateY(-2px)",
              },
            },
          }}
        >
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>{pkg.name}</Title>
              <Badge color={getScoreColor(pkg.quality)} variant="light">
                {pkg.quality ?? "N/A"}/100
              </Badge>
            </Group>

            <Text size="sm" c="dimmed" lineClamp={2}>
              {pkg.description || "No description available"}
            </Text>

            <Divider />

            <Group gap="xl">
              <Stack gap={4}>
                <Text size="xs" c="dimmed">
                  Weekly Downloads
                </Text>
                <Text size="lg" fw={600}>
                  {formatNumber(pkg.weeklyDownloads)}
                </Text>
              </Stack>
              <Stack gap={4}>
                <Text size="xs" c="dimmed">
                  GitHub Stars
                </Text>
                <Text size="lg" fw={600}>
                  {formatNumber(pkg.stars)}
                </Text>
              </Stack>
              <Stack gap={4}>
                <Text size="xs" c="dimmed">
                  Forks
                </Text>
                <Text size="lg" fw={600}>
                  {formatNumber(pkg.forks)}
                </Text>
              </Stack>
            </Group>

            <Group gap="xs">
              <Text size="xs" c="dimmed">
                Quality:
              </Text>
              <Badge size="xs" color={getScoreColor(pkg.quality)}>
                {pkg.quality ?? "N/A"}
              </Badge>
              <Text size="xs" c="dimmed">
                Popularity:
              </Text>
              <Badge size="xs" color={getScoreColor(pkg.popularity)}>
                {pkg.popularity ?? "N/A"}
              </Badge>
              <Text size="xs" c="dimmed">
                Maintenance:
              </Text>
              <Badge size="xs" color={getScoreColor(pkg.maintenance)}>
                {pkg.maintenance ?? "N/A"}
              </Badge>
            </Group>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
}

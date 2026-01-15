import { Badge, Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import type { MetricComparison } from "@/types/adapter";
import { IconTrendingUp } from "@tabler/icons-react";

interface MetricCardProps {
  metric: MetricComparison;
}

function formatNumber(value: string | number | null): string {
  if (value === null) return "N/A";
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return "N/A";
  if (numValue >= 1000000) return `${(numValue / 1000000).toFixed(1)}M`;
  if (numValue >= 1000) return `${(numValue / 1000).toFixed(1)}K`;
  return numValue.toString();
}

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <Card
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
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <ThemeIcon color="brand" variant="light" size="sm">
            <IconTrendingUp size={16} />
          </ThemeIcon>
          <Text fw={500} size="sm">
            {metric.name}
          </Text>
        </Group>
      </Group>

      <Stack gap="sm">
        {metric.values.map((pkg) => (
          <Group key={pkg.packageIndex} justify="space-between">
            <Group gap="xs">
              <Text size="sm" c={pkg.isWinner ? "brand.6" : "dimmed"}>
                {pkg.packageName}
              </Text>
              {pkg.isWinner && (
                <Badge size="xs" color="success" variant="light">
                  Best
                </Badge>
              )}
            </Group>

            <Group gap="sm">
              {pkg.percentDiff !== undefined && pkg.percentDiff !== 0 && (
                <Text size="xs" c={pkg.percentDiff > 0 ? "green" : "red"}>
                  {pkg.percentDiff > 0 ? "+" : ""}
                  {pkg.percentDiff.toFixed(1)}%
                </Text>
              )}
              <Text fw={pkg.isWinner ? 700 : 400} size="lg">
                {formatNumber(pkg.value)}
              </Text>
            </Group>
          </Group>
        ))}
      </Stack>
    </Card>
  );
}

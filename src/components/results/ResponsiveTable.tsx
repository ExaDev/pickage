import { useMediaQuery } from "@mantine/hooks";
import {
  Card,
  Stack,
  Text,
  Title,
  Badge,
  Group,
  SimpleGrid,
} from "@mantine/core";
import type { NPackageComparison } from "@/types/adapter";
import { ComparisonTable } from "../comparison/ComparisonTable";

interface ResponsiveTableProps {
  comparison: NPackageComparison;
}

interface MetricCardProps {
  title: string;
  packages: Array<{
    name: string;
    value: string | number | null;
    isWinner?: boolean;
    percentDiff?: number;
  }>;
}

function MetricCard({ title, packages }: MetricCardProps): React.ReactNode {
  const formatValue = (value: string | number | null): string => {
    if (value === null) return "N/A";
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <Card
      padding="md"
      withBorder
      role="region"
      aria-label={`${title} comparison`}
    >
      <Stack gap="sm">
        <Text size="sm" c="dimmed" fw={500}>
          {title}
        </Text>
        {packages.map((pkg) => (
          <Group
            key={pkg.name}
            justify="space-between"
            aria-label={
              pkg.isWinner
                ? `${pkg.name} is best for ${title}`
                : `${pkg.name} ${title}`
            }
          >
            <Group gap="xs">
              <Text size="sm">{pkg.name}</Text>
              {pkg.isWinner && (
                <Badge size="xs" color="success">
                  Best
                </Badge>
              )}
            </Group>
            <Group gap="xs">
              <Text size="sm" fw={pkg.isWinner ? 700 : 400}>
                {formatValue(pkg.value)}
              </Text>
              {pkg.percentDiff !== undefined && pkg.value !== null && (
                <Text size="xs" c="dimmed">
                  {pkg.percentDiff > 0 ? "+" : ""}
                  {pkg.percentDiff.toFixed(1)}%
                </Text>
              )}
            </Group>
          </Group>
        ))}
      </Stack>
    </Card>
  );
}

export function ResponsiveTable({ comparison }: ResponsiveTableProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return (
      <Stack gap="md">
        <Title order={4}>Full Comparison</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          {comparison.metricComparisons.map((metric) => (
            <MetricCard
              key={metric.name}
              title={metric.name}
              packages={metric.values.map((value) => ({
                name: comparison.packages[value.packageIndex].name,
                value: value.value,
                isWinner: value.isWinner,
                percentDiff: value.percentDiff,
              }))}
            />
          ))}
        </SimpleGrid>
      </Stack>
    );
  }

  return <ComparisonTable comparison={comparison} />;
}

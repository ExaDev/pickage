import { Accordion, SimpleGrid, Stack, Title } from '@mantine/core';
import type { NPackageComparison } from '@/types/adapter';
import { MetricCard } from './MetricCard';
import { PackageCards } from './PackageCards';
import { ComparisonTable } from '../comparison/ComparisonTable';

interface ResultsDashboardProps {
  comparison: NPackageComparison;
}

export function ResultsDashboard({ comparison }: ResultsDashboardProps) {
  return (
    <Stack gap="xl">
      {/* Package Cards - Mobile First Layout */}
      <Stack gap="md">
        <Title order={3}>Packages ({comparison.packages.length})</Title>
        <PackageCards packages={comparison.packages} />
      </Stack>

      {/* Metrics Comparison - Cards */}
      <Stack gap="md">
        <Title order={3}>Metrics Comparison</Title>
        <SimpleGrid
          cols={{ base: 1, sm: 2, md: 3 }}
          spacing="md"
        >
          {comparison.metricComparisons.map((metric) => (
            <MetricCard key={metric.name} metric={metric} />
          ))}
        </SimpleGrid>
      </Stack>

      {/* Full Comparison Table - Collapsible */}
      <Accordion variant="contained" chevronPosition="left">
        <Accordion.Item value="full-table">
          <Accordion.Control>
            <Title order={4}>View Full Comparison Table</Title>
          </Accordion.Control>
          <Accordion.Panel>
            <ComparisonTable comparison={comparison} />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
}

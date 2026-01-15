import { Table, Text } from '@mantine/core';
import type { ComparisonResult } from '@/services/comparator';

interface ComparisonTableProps {
  comparison: ComparisonResult;
}

export function ComparisonTable({ comparison }: ComparisonTableProps) {
  const { package1, package2, differences } = comparison;

  const formatValue = (value: number | string | null): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const getWinnerStyle = (winner: string, packageName: string) => {
    if (winner === 'tie') return {};
    if (winner === 'none') return {};
    return winner === packageName ? { fontWeight: 'bold' } : {};
  };

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Metric</Table.Th>
          <Table.Th>{package1.name}</Table.Th>
          <Table.Th>{package2.name}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {differences.map((diff, index) => (
          <Table.Tr key={index}>
            <Table.Td>
              <Text fw={500}>{diff.metric}</Text>
            </Table.Td>
            <Table.Td style={getWinnerStyle(diff.winner, 'package1')}>
              {formatValue(diff.package1Value)}
              {diff.percentageDiff && (
                <Text size="xs" c="dimmed">
                  {diff.percentageDiff > 0 ? '+' : ''}
                  {diff.percentageDiff.toFixed(1)}%
                </Text>
              )}
            </Table.Td>
            <Table.Td style={getWinnerStyle(diff.winner, 'package2')}>
              {formatValue(diff.package2Value)}
              {diff.percentageDiff && diff.winner === 'package2' && (
                <Text size="xs" c="dimmed">
                  {diff.percentageDiff > 0 ? '+' : ''}
                  {(-diff.percentageDiff).toFixed(1)}%
                </Text>
              )}
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

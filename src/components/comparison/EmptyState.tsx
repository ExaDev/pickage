import { Box, Code, Container, Group, Stack, Text, Title } from '@mantine/core';

export function EmptyState() {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="lg">
        <Box c="brand" style={{ fontSize: 80, textAlign: 'center' }}>
          🔍
        </Box>
        <Title order={2} ta="center">
          Compare npm packages with confidence
        </Title>
        <Text c="dimmed" ta="center" size="lg">
          Enter 2-6 package names to see side-by-side comparisons of downloads,
          GitHub stats, quality scores, and more.
        </Text>
        <Group gap="xs">
          <Text size="sm">Try:</Text>
          <Code>react</Code>
          <Text>,</Text>
          <Code>vue</Code>
          <Text>,</Text>
          <Code>preact</Code>
        </Group>
      </Stack>
    </Container>
  );
}

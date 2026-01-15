import { Badge, Button, Container, Group, Paper, Title } from "@mantine/core";
import { useState, useEffect } from "react";

interface StickyInputBarProps {
  packages: string[];
  onClear: () => void;
}

export function StickyInputBar({ packages, onClear }: StickyInputBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handler = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handler);
    return () => {
      window.removeEventListener("scroll", handler);
    };
  }, []);

  return (
    <Paper
      shadow={isScrolled ? "md" : "none"}
      px="md"
      py="xs"
      bg={{ base: "white", dark: "dark.7" }}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: isScrolled ? "1px solid lightgray" : "none",
        transition: "all 0.2s",
      }}
    >
      <Container size="xl">
        <Group justify="space-between">
          <Group gap="xs">
            <Title order={4}>PeekPackage</Title>
            {packages.length > 0 && (
              <Group gap={4}>
                {packages.map((pkg) => (
                  <Badge key={pkg} variant="light" color="brand">
                    {pkg}
                  </Badge>
                ))}
              </Group>
            )}
          </Group>
          {packages.length > 0 && (
            <Button variant="light" size="sm" onClick={onClear}>
              Clear
            </Button>
          )}
        </Group>
      </Container>
    </Paper>
  );
}

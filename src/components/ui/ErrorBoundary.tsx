import { Component, type ReactNode } from "react";
import { Button, Container, Paper, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component that catches JavaScript errors in child components.
 * Displays a fallback UI instead of crashing the entire app.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details for debugging
    console.error("ErrorBoundary caught an error:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <Container size="sm" py="xl">
          <Paper p="xl" radius="md" withBorder>
            <Stack align="center" gap="lg">
              <IconAlertTriangle size={48} color="var(--mantine-color-red-6)" />

              <Title order={2} ta="center">
                Something went wrong
              </Title>

              <Text c="dimmed" ta="center" maw={400}>
                An unexpected error occurred. You can try again or reload the
                page.
              </Text>

              {this.state.error && (
                <Paper
                  p="md"
                  radius="sm"
                  withBorder
                  bg="gray.0"
                  style={{ width: "100%", maxWidth: 500 }}
                >
                  <Text size="xs" ff="monospace" c="red">
                    {this.state.error.message}
                  </Text>
                </Paper>
              )}

              <Stack gap="sm">
                <Button
                  leftSection={<IconRefresh size={16} />}
                  onClick={this.handleRetry}
                >
                  Try Again
                </Button>
                <Button variant="light" onClick={this.handleReload}>
                  Reload Page
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

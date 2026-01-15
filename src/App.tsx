import { useState, useEffect, useRef } from "react";
import { Alert, Button, Container, Group, Stack, Title } from "@mantine/core";
import { IconAlertCircle, IconDownload } from "@tabler/icons-react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "./theme";
import { PackageInput } from "./components/comparison/PackageInput";
import { ReadmeAccordion } from "./components/ui/ReadmeAccordion";
import { SettingsModal } from "./components/ui/SettingsModal";
import { EmptyState } from "./components/comparison/EmptyState";
import { StickyInputBar } from "./components/comparison/StickyInputBar";
import { ResultsSkeleton } from "./components/comparison/ResultsSkeleton";
import { ResultsDashboard } from "./components/results/ResultsDashboard";
import { ShareButton } from "./components/ui/ShareButton";
import { HistoryPanel } from "./components/ui/HistoryPanel";
import { usePackageComparison } from "./hooks/usePackageComparison";
import { useShareableUrl } from "./hooks/useShareableUrl";
import { useComparisonHistory } from "./hooks/useComparisonHistory";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { ComparatorService } from "./services/comparator";
import { exportToCsv } from "./utils/exportToCsv";
import { useSearchParams } from "react-router-dom";
import type { PackageInputHandle } from "./components/comparison/PackageInput";

function App() {
  const [searchParams] = useSearchParams();
  const [packageNames, setPackageNames] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const packageInputRef = useRef<PackageInputHandle>(null);

  const { isLoading, isError, errors, packages } =
    usePackageComparison(packageNames);

  const comparator = new ComparatorService();
  const comparison =
    packages.length > 0 ? comparator.compareMany(packages) : null;

  const { shareUrl } = useShareableUrl(packageNames);
  const { history, addToHistory, clearHistory, formatRelativeTime } =
    useComparisonHistory();

  // Keyboard navigation
  useKeyboardNavigation({
    onFocusInput: () => packageInputRef.current?.focus(),
    onClear: () => {
      setPackageNames([]);
      setShowComparison(false);
    },
    onSubmit: () => {
      if (packageNames.length >= 2) {
        setShowComparison(true);
      }
    },
  });

  // Load packages from URL on mount
  useEffect(() => {
    const urlPackages = searchParams.get("packages")?.split(",");
    if (urlPackages && urlPackages.length >= 2) {
      setPackageNames(urlPackages);
      setShowComparison(true);
    }
  }, [searchParams]);

  const handleCompare = (names: string[]) => {
    setPackageNames(names);
    setShowComparison(true);
    addToHistory(names);
  };

  const handleExport = () => {
    if (packages.length > 0) {
      exportToCsv(packages);
    }
  };

  const getErrorMessage = () => {
    if (errors.length === 0) return "Failed to load package data";
    if (errors.length === 1) return errors[0].message;
    return `${String(errors.length)} packages failed to load`;
  };

  return (
    <MantineProvider theme={theme}>
      <Notifications />

      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        style={{
          position: "absolute",
          left: "-9999px",
          zIndex: 999,
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
        onFocus={(e) => {
          e.target.style.left = "0";
          e.target.style.top = "0";
          e.target.style.width = "auto";
          e.target.style.height = "auto";
        }}
        onBlur={(e) => {
          e.target.style.left = "-9999px";
          e.target.style.width = "1px";
          e.target.style.height = "1px";
        }}
      >
        Skip to main content
      </a>

      <StickyInputBar
        packages={packageNames}
        onClear={() => {
          setPackageNames([]);
          setShowComparison(false);
        }}
      />
      <Container id="main-content" size="xl" py="xl">
        <Group justify="space-between" mb="xl">
          <Title>PkgCompare</Title>
          <Group gap="sm">
            <HistoryPanel
              history={history}
              formatRelativeTime={formatRelativeTime}
              onLoadComparison={(pkgs) => {
                setPackageNames(pkgs);
                setShowComparison(true);
              }}
              onClearHistory={clearHistory}
            />
            {showComparison && packages.length > 0 && (
              <>
                <ShareButton shareUrl={shareUrl} />
                <Button
                  variant="light"
                  color="brand"
                  size="sm"
                  leftSection={<IconDownload size={16} />}
                  onClick={handleExport}
                >
                  Export
                </Button>
              </>
            )}
            <SettingsModal />
          </Group>
        </Group>

        <Stack gap="xl">
          <PackageInput
            ref={packageInputRef}
            onCompare={handleCompare}
            loading={isLoading}
          />

          {isError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error"
              color="red"
            >
              {getErrorMessage()}
            </Alert>
          )}

          {isLoading && <ResultsSkeleton />}

          {!isLoading && !showComparison && <EmptyState />}

          {showComparison && comparison && (
            <>
              <ResultsDashboard comparison={comparison} />

              <Stack gap="md">
                <Title order={3}>READMEs</Title>
                <ReadmeAccordion packages={packages} />
              </Stack>
            </>
          )}
        </Stack>
      </Container>
    </MantineProvider>
  );
}

export default App;

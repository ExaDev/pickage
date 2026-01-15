import { useState } from "react";
import { Alert, Container, Group, Stack, Title } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { MantineProvider } from "@mantine/core";
import { theme } from "./theme";
import { PackageInput } from "./components/comparison/PackageInput";
import { ReadmeAccordion } from "./components/ui/ReadmeAccordion";
import { SettingsModal } from "./components/ui/SettingsModal";
import { EmptyState } from "./components/comparison/EmptyState";
import { StickyInputBar } from "./components/comparison/StickyInputBar";
import { ResultsSkeleton } from "./components/comparison/ResultsSkeleton";
import { ResultsDashboard } from "./components/results/ResultsDashboard";
import { usePackageComparison } from "./hooks/usePackageComparison";
import { ComparatorService } from "./services/comparator";

function App() {
  const [packageNames, setPackageNames] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const { isLoading, isError, errors, packages } =
    usePackageComparison(packageNames);

  const comparator = new ComparatorService();
  const comparison =
    packages.length > 0 ? comparator.compareMany(packages) : null;

  const handleCompare = (names: string[]) => {
    setPackageNames(names);
    setShowComparison(true);
  };

  const getErrorMessage = () => {
    if (errors.length === 0) return "Failed to load package data";
    if (errors.length === 1) return errors[0].message;
    return `${String(errors.length)} packages failed to load`;
  };

  return (
    <MantineProvider theme={theme}>
      <StickyInputBar
        packages={packageNames}
        onClear={() => {
          setPackageNames([]);
          setShowComparison(false);
        }}
      />
      <Container size="xl" py="xl">
        <Group justify="space-between" mb="xl">
          <Title>PkgCompare</Title>
          <SettingsModal />
        </Group>

        <Stack gap="xl">
          <PackageInput onCompare={handleCompare} loading={isLoading} />

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

import { useState } from 'react';
import {
  Alert,
  Container,
  Group,
  Stack,
  Title,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { PackageInput } from './components/comparison/PackageInput';
import { ComparisonTable } from './components/comparison/ComparisonTable';
import { ReadmeDisplay } from './components/ui/ReadmeDisplay';
import { SettingsModal } from './components/ui/SettingsModal';
import { usePackageComparison } from './hooks/usePackageComparison';
import { ComparatorService } from './services/comparator';

function App() {
  const [package1, setPackage1] = useState('');
  const [package2, setPackage2] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  const { isLoading, isError, error, package1: pkg1, package2: pkg2 } =
    usePackageComparison(package1, package2);

  const comparator = new ComparatorService();
  const comparison = pkg1 && pkg2 ? comparator.compare(pkg1, pkg2) : null;

  const handleCompare = (p1: string, p2: string) => {
    setPackage1(p1);
    setPackage2(p2);
    setShowComparison(true);
  };

  return (
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
            {error?.message || 'Failed to load package data'}
          </Alert>
        )}

        {showComparison && comparison && (
          <>
            <ComparisonTable comparison={comparison} />

            <Stack gap="md">
              <Title order={3}>READMEs</Title>
              {pkg1?.github?.readme && (
                <ReadmeDisplay
                  packageName={pkg1.name}
                  readme={pkg1.github.readme}
                />
              )}
              {pkg2?.github?.readme && (
                <ReadmeDisplay
                  packageName={pkg2.name}
                  readme={pkg2.github.readme}
                />
              )}
            </Stack>
          </>
        )}
      </Stack>
    </Container>
  );
}

export default App;

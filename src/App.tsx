import { useState } from "react";
import { Container } from "@mantine/core";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "./theme";
import { usePackageColumn } from "./hooks/usePackageColumn";
import { PackageComparisonLayout } from "./components/comparison/PackageComparisonLayout";
import { StickyInputBar } from "./components/comparison/StickyInputBar";
import type { ViewMode } from "./types/views";

function App() {
  const { packages, addPackage, removePackage, canRemove } = usePackageColumn();
  const packageNames = packages.map((pkg) => pkg.packageName);
  const [viewMode, setViewMode] = useState<ViewMode>("carousel");

  const handleClear = () => {
    // Remove all packages
    packages.forEach((pkg) => {
      removePackage(pkg.id);
    });
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
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onClear={handleClear}
        onAddPackage={addPackage}
      />

      <Container id="main-content" size="xl" py="xl">
        <PackageComparisonLayout
          packages={packages}
          viewMode={viewMode}
          removePackage={removePackage}
          canRemove={canRemove}
        />
      </Container>
    </MantineProvider>
  );
}

export default App;

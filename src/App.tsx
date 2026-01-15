import { useState, useEffect } from "react";
import { Box } from "@mantine/core";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "./theme";
import { usePackageColumn } from "./hooks/usePackageColumn";
import { getInitialSortFromUrl, parseSortFromUrl } from "./hooks/useUrlSync";
import { PackageComparisonLayout } from "./components/comparison/PackageComparisonLayout";
import { StickyInputBar } from "./components/comparison/StickyInputBar";
import type { ViewMode } from "./types/views";
import type { SortCriterion } from "./types/sort";

// Header height for viewport calculations
const HEADER_HEIGHT = 56;

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("carousel");
  const [sortCriteria, setSortCriteria] = useState<SortCriterion[]>(
    getInitialSortFromUrl,
  );

  // Pass sortCriteria to usePackageColumn for URL sync coordination
  const { packages, addPackage, removePackage, canRemove } = usePackageColumn({
    sortCriteria,
  });
  const packageNames = packages.map((pkg) => pkg.packageName);

  // Handle browser back/forward for sort criteria
  useEffect(() => {
    const handlePopstate = () => {
      const urlSort = parseSortFromUrl();
      setSortCriteria(urlSort);
    };

    window.addEventListener("popstate", handlePopstate);
    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, []);

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

      <Box
        id="main-content"
        style={{
          height: `calc(100vh - ${String(HEADER_HEIGHT)}px)`,
          overflow: "hidden",
        }}
      >
        <PackageComparisonLayout
          packages={packages}
          viewMode={viewMode}
          removePackage={removePackage}
          canRemove={canRemove}
          sortCriteria={sortCriteria}
          onSortChange={setSortCriteria}
        />
      </Box>
    </MantineProvider>
  );
}

export default App;

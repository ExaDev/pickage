import { useState, useEffect, useMemo, useRef } from "react";
import { notifications } from "@mantine/notifications";
import {
  getInitialPackagesFromUrl,
  updateUrlWithPackages,
  parsePackagesFromUrl,
} from "./useUrlSync";
import type { SortCriterion } from "@/types/sort";

// No minimum - users can have 0 packages (shows empty state)

/**
 * Create initial packages from URL or empty array
 */
function createInitialPackages(): PackageColumnState[] {
  const urlPackages = getInitialPackagesFromUrl();

  if (urlPackages.length === 0) {
    return [];
  }

  return urlPackages.map((packageName) => ({
    id: crypto.randomUUID(),
    packageName,
  }));
}

export interface PackageColumnState {
  id: string;
  packageName: string;
}

export interface UsePackageColumnReturn {
  packages: PackageColumnState[];
  addPackage: (name: string) => void;
  removePackage: (id: string) => void;
  canRemove: boolean;
}

interface UsePackageColumnOptions {
  sortCriteria?: SortCriterion[];
}

export function usePackageColumn(
  options: UsePackageColumnOptions = {},
): UsePackageColumnReturn {
  const { sortCriteria = [] } = options;

  const [packages, setPackages] = useState<PackageColumnState[]>(
    createInitialPackages,
  );

  // Track if we're handling a popstate to avoid pushing duplicate history
  const isHandlingPopstate = useRef(false);

  // Extract package names for URL sync
  const packageNames = useMemo(
    () => packages.map((pkg) => pkg.packageName),
    [packages],
  );

  // Sync URL when packages or sort criteria change (skip during popstate handling)
  useEffect(() => {
    if (isHandlingPopstate.current) {
      isHandlingPopstate.current = false;
      return;
    }
    updateUrlWithPackages(
      packageNames.map((name) => ({ ecosystem: "npm" as const, name })),
      sortCriteria,
    );
  }, [packageNames, sortCriteria]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopstate = () => {
      isHandlingPopstate.current = true;
      const urlPackages = parsePackagesFromUrl();
      const newPackages = urlPackages.map((pkg) => ({
        id: crypto.randomUUID(),
        packageName: pkg.name,
      }));
      setPackages(newPackages);
    };

    window.addEventListener("popstate", handlePopstate);
    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, []);

  const addPackage = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    // Check for duplicates (case-insensitive)
    const isDuplicate = packages.some(
      (pkg) => pkg.packageName.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (isDuplicate) {
      notifications.show({
        title: "Package already added",
        message: `"${trimmedName}" is already in your comparison`,
        color: "yellow",
      });
      return;
    }

    setPackages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        packageName: trimmedName,
      },
    ]);
  };

  const removePackage = (id: string) => {
    setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
  };

  return {
    packages,
    addPackage,
    removePackage,
    canRemove: packages.length > 0,
  };
}

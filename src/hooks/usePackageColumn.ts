import { useState, useEffect, useMemo } from "react";
import { getInitialPackagesFromUrl, updateUrlWithPackages } from "./useUrlSync";

const MAX_PACKAGES = 6;
const MIN_PACKAGES = 1;

/**
 * Create initial columns from URL packages or default empty column
 */
function createInitialColumns(): PackageColumnState[] {
  const urlPackages = getInitialPackagesFromUrl();

  if (urlPackages.length === 0) {
    return [
      {
        id: crypto.randomUUID(),
        value: "",
        searchQuery: "",
        submittedValue: "",
      },
    ];
  }

  // Create columns for each URL package (up to MAX_PACKAGES)
  return urlPackages.slice(0, MAX_PACKAGES).map((packageName) => ({
    id: crypto.randomUUID(),
    value: packageName,
    searchQuery: "",
    submittedValue: packageName,
  }));
}

export interface PackageColumnState {
  id: string;
  /** Current input value (what user sees in the field) */
  value: string;
  /** Current search query for autocomplete */
  searchQuery: string;
  /** Submitted value that triggers API fetch (set on Enter/blur/selection) */
  submittedValue: string;
}

export interface UsePackageColumnReturn {
  columns: PackageColumnState[];
  addColumn: () => void;
  removeColumn: (id: string) => void;
  updateColumn: (id: string, updates: Partial<PackageColumnState>) => void;
  canAddMore: boolean;
  canRemove: boolean;
}

export function usePackageColumn(): UsePackageColumnReturn {
  const [columns, setColumns] =
    useState<PackageColumnState[]>(createInitialColumns);

  // Extract submitted package names for URL sync
  const submittedPackages = useMemo(
    () =>
      columns
        .map((col) => col.submittedValue.trim())
        .filter((name) => name.length > 0),
    [columns],
  );

  // Sync URL when submitted packages change
  useEffect(() => {
    updateUrlWithPackages(
      submittedPackages.map((name) => ({ ecosystem: "npm" as const, name })),
    );
  }, [submittedPackages]);

  const addColumn = () => {
    if (columns.length >= MAX_PACKAGES) return;
    setColumns((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        value: "",
        searchQuery: "",
        submittedValue: "",
      },
    ]);
  };

  const removeColumn = (id: string) => {
    if (columns.length <= MIN_PACKAGES) return;
    setColumns((prev) => prev.filter((col) => col.id !== id));
  };

  const updateColumn = (id: string, updates: Partial<PackageColumnState>) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, ...updates } : col)),
    );
  };

  return {
    columns,
    addColumn,
    removeColumn,
    updateColumn,
    canAddMore: columns.length < MAX_PACKAGES,
    canRemove: columns.length > MIN_PACKAGES,
  };
}

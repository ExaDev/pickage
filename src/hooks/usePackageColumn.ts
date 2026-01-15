import { useState } from "react";

const MAX_PACKAGES = 6;
const MIN_PACKAGES = 1;

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
  const [columns, setColumns] = useState<PackageColumnState[]>([
    { id: crypto.randomUUID(), value: "", searchQuery: "", submittedValue: "" },
  ]);

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

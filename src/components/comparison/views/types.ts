import type { PackageColumnState } from "@/hooks/usePackageColumn";
import type { PackageStats } from "@/types/adapter";

/**
 * Shared props for all view components
 */
export interface ViewProps {
  packages: PackageColumnState[];
  packagesData: PackageStats[];
  isLoading: boolean;
  winnerMetrics: Record<string, Record<string, boolean>>;
  canRemove: boolean;
  onRemove: (id: string) => void;
}

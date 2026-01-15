import type { PackageColumnState } from "@/hooks/usePackageColumn";
import type { PackageStats } from "@/types/adapter";
import type { SortCriterion } from "@/types/sort";

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
  // npm data refetch
  refetchingNpmPackages: Record<string, boolean>;
  onRefreshNpm: (packageName: string) => void;
  // GitHub data refetch
  refetchingGithubPackages: Record<string, boolean>;
  onRefreshGithub: (packageName: string) => void;
  // Legacy (refetch both)
  refetchingPackages: Record<string, boolean>;
  onRefresh: (packageName: string) => void;
  // Sorting (optional - only carousel uses sidebar)
  sortCriteria?: SortCriterion[];
  onSortChange?: (criteria: SortCriterion[]) => void;
}

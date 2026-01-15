/**
 * Request interface for fetching package comparison data
 */
export interface PeekPackageRequest {
  packageName: string;
  ecosystem: "npm" | "pypi" | "cargo";
}

/**
 * Response interface with unified stats format
 * Uses optional fields to handle ecosystem-specific data
 */
export interface PackageStats {
  // Core package metadata (required across all ecosystems)
  name: string;
  description: string | null;
  version: string;
  homepage: string | null;
  repository: string | null;

  // Popularity metrics (optional - may not exist for all packages)
  weeklyDownloads?: number;
  totalDownloads?: number;
  stars?: number;
  forks?: number;

  // Maintenance metrics (optional)
  lastPublish?: string;
  openIssues?: number;
  commits?: number;
  contributors?: number;

  // Quality scores (npms.io specific)
  quality?: number;
  popularity?: number;
  maintenance?: number;

  // Ecosystem-specific extensions
  npm?: NpmSpecificStats;
  github?: GithubSpecificStats;
}

/**
 * npm-specific statistics
 */
export interface NpmSpecificStats {
  dependencies: string[];
  devDependencies: string[];
  peerDependencies: Record<string, string>;
  license: string;
  size: number;
  keywords: string[];
}

/**
 * GitHub-specific statistics
 */
export interface GithubSpecificStats {
  stars: number;
  forks: number;
  openIssues: number;
  subscribers: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  defaultBranch: string;
  readme: string | null;
  homepageUrl: string;
}

/**
 * Comparison result for N packages
 */
export interface NPackageComparison {
  packages: PackageStats[];
  metricComparisons: MetricComparison[];
}

/**
 * Metric comparison across N packages
 */
export interface MetricComparison {
  name: string;
  values: Array<{
    packageIndex: number;
    packageName: string;
    value: number | string | null;
    isWinner: boolean;
    percentDiff?: number;
  }>;
}

/**
 * Legacy comparison result for 2 packages (deprecated, kept for compatibility)
 */
export interface ComparisonResult {
  package1: PackageStats;
  package2: PackageStats;
  differences: PackageDifference[];
}

/**
 * Single metric difference (deprecated)
 */
export interface PackageDifference {
  metric: string;
  package1Value: number | string | null;
  package2Value: number | string | null;
  winner: "package1" | "package2" | "tie" | "none";
  percentageDiff?: number;
}

/**
 * Ecosystem adapter interface
 * All adapters must implement this interface
 */
export interface EcosystemAdapter {
  /**
   * Fetch package statistics from multiple sources
   * @param request Package comparison request
   * @returns Normalized package statistics
   */
  fetch(request: PeekPackageRequest): Promise<PackageStats>;

  /**
   * Check if adapter supports the given ecosystem
   */
  supports(ecosystem: string): boolean;
}

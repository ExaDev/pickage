/**
 * Request interface for fetching package comparison data
 */
export interface PkgCompareRequest {
  packageName: string;
  ecosystem: 'npm' | 'pypi' | 'cargo';
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
 * Ecosystem adapter interface
 * All adapters must implement this interface
 */
export interface EcosystemAdapter {
  /**
   * Fetch package statistics from multiple sources
   * @param request Package comparison request
   * @returns Normalized package statistics
   */
  fetch(request: PkgCompareRequest): Promise<PackageStats>;

  /**
   * Check if adapter supports the given ecosystem
   */
  supports(ecosystem: string): boolean;
}

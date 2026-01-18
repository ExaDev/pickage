/**
 * Request interface for fetching package comparison data
 */
export interface PickageRequest {
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
  dependentsCount?: number;

  // Maintenance metrics (optional)
  lastPublish?: string;
  openIssues?: number;
  commits?: number;

  // Quality scores (npms.io specific, 0-100)
  quality?: number;
  popularity?: number;
  maintenance?: number;
  finalScore?: number;

  // Author/maintainer info
  author?: {
    name: string;
    email?: string;
    url?: string;
  } | null;
  maintainers?: Array<{
    name: string;
    email?: string;
  }>;
  // GitHub contributors with commit counts (sorted by commits desc)
  contributors?: Array<{
    username: string;
    commitsCount: number;
  }>;

  // Links
  links?: {
    npm?: string;
    pypi?: string;
    homepage?: string | null;
    repository?: string | null;
    bugs?: string | null;
  };

  // Detailed evaluation scores (npms.io)
  evaluation?: {
    quality: {
      carefulness: number;
      tests: number;
      health: number;
      branding: number;
    };
    popularity: {
      communityInterest: number;
      downloadsCount: number;
      downloadsAcceleration: number;
      dependentsCount: number;
    };
    maintenance: {
      releasesFrequency: number;
      commitsFrequency: number;
      openIssues: number;
      issuesDistribution: number;
    };
  };

  // Ecosystem-specific extensions
  npm?: NpmSpecificStats;
  github?: GithubSpecificStats;
  pypi?: PyPiSpecificStats;
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
 * Core metrics (stars, forks, openIssues, subscribers) are always available
 * Other fields are only available from GitHub API, not npms.io fallback
 */
export interface GithubSpecificStats {
  // Always available (from npms.io or GitHub API)
  stars: number;
  forks: number;
  openIssues: number;
  subscribers: number;
  // Only available from GitHub API
  createdAt?: string;
  updatedAt?: string;
  pushedAt?: string;
  defaultBranch?: string;
  readme?: string | null;
  homepageUrl?: string;
  language?: string | null;
  size?: number;
}

/**
 * PyPI-specific statistics
 */
export interface PyPiSpecificStats {
  requiresPython: string | null;
  dependencies: string[];
  license: string | null;
  classifiers: string[];
  uploads: number;
  upload_time: string | null;
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
  fetch(request: PickageRequest): Promise<PackageStats>;

  /**
   * Check if adapter supports the given ecosystem
   */
  supports(ecosystem: string): boolean;
}

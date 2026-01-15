import type { PackageStats } from '@/types/adapter';

/**
 * Comparison result for two packages
 */
export interface ComparisonResult {
  package1: PackageStats;
  package2: PackageStats;
  differences: PackageDifference[];
}

/**
 * Single metric difference
 */
export interface PackageDifference {
  metric: string;
  package1Value: number | string | null;
  package2Value: number | string | null;
  winner: 'package1' | 'package2' | 'tie' | 'none';
  percentageDiff?: number;
}

/**
 * Service for comparing packages side-by-side
 */
export class ComparatorService {
  /**
   * Compare two packages and highlight differences
   */
  compare(pkg1: PackageStats, pkg2: PackageStats): ComparisonResult {
    const differences: PackageDifference[] = [];

    const numericalMetrics: Array<keyof PackageStats> = [
      'weeklyDownloads',
      'totalDownloads',
      'stars',
      'forks',
      'openIssues',
      'quality',
      'popularity',
      'maintenance',
    ];

    for (const metric of numericalMetrics) {
      const val1 = pkg1[metric] as number | undefined;
      const val2 = pkg2[metric] as number | undefined;

      if (val1 !== undefined && val2 !== undefined) {
        differences.push({
          metric: this.formatMetricName(metric),
          package1Value: val1,
          package2Value: val2,
          winner: val1 > val2 ? 'package1' : val1 < val2 ? 'package2' : 'tie',
          percentageDiff: this.calculatePercentageDiff(val1, val2),
        });
      }
    }

    return {
      package1: pkg1,
      package2: pkg2,
      differences,
    };
  }

  /**
   * Format metric name for display
   */
  private formatMetricName(metric: string): string {
    const nameMap: Record<string, string> = {
      weeklyDownloads: 'Weekly Downloads',
      totalDownloads: 'Total Downloads',
      stars: 'GitHub Stars',
      forks: 'GitHub Forks',
      openIssues: 'Open Issues',
      quality: 'Quality Score',
      popularity: 'Popularity Score',
      maintenance: 'Maintenance Score',
    };
    return nameMap[metric] || metric;
  }

  /**
   * Calculate percentage difference
   */
  private calculatePercentageDiff(val1: number, val2: number): number {
    if (val1 === 0 && val2 === 0) return 0;
    if (val1 === 0) return 100;
    return ((val2 - val1) / val1) * 100;
  }
}

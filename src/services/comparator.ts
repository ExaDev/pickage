import type { PackageStats, NPackageComparison, MetricComparison, ComparisonResult, PackageDifference } from '@/types/adapter';

/**
 * Service for comparing packages side-by-side
 */
export class ComparatorService {
  /**
   * Compare N packages and highlight differences
   */
  compareMany(packages: PackageStats[]): NPackageComparison {
    if (packages.length === 0) {
      return { packages: [], metricComparisons: [] };
    }

    const metricComparisons: MetricComparison[] = [];

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
      const values = packages.map((pkg, index) => ({
        packageIndex: index,
        packageName: pkg.name,
        value: pkg[metric] as number | undefined,
      }));

      const validValues = values.filter((v) => v.value !== undefined);
      if (validValues.length === 0) continue;

      const numericValues = validValues.map((v) => v.value as number);
      const maxValue = Math.max(...numericValues);

      const comparisonValues = values.map((v) => {
        const isWinner = v.value === maxValue;
        const percentDiff =
          v.value !== undefined && maxValue !== 0 && v.value !== maxValue
            ? ((v.value - maxValue) / maxValue) * 100
            : undefined;

        return {
          packageIndex: v.packageIndex,
          packageName: v.packageName,
          value: v.value ?? null,
          isWinner,
          percentDiff,
        };
      });

      metricComparisons.push({
        name: this.formatMetricName(metric),
        values: comparisonValues,
      });
    }

    return {
      packages,
      metricComparisons,
    };
  }

  /**
   * Compare two packages and highlight differences (legacy method)
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
   * Calculate percentage difference (legacy method)
   */
  private calculatePercentageDiff(val1: number, val2: number): number {
    if (val1 === 0 && val2 === 0) return 0;
    if (val1 === 0) return 100;
    return ((val2 - val1) / val1) * 100;
  }
}

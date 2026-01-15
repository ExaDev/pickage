import type { EcosystemAdapter, PkgCompareRequest, PackageStats } from '@/types/adapter';
import { NpmsClient } from './npms-client';
import { GithubClient } from './github-client';

/**
 * npm ecosystem adapter implementing EcosystemAdapter interface
 * Fetches data from npms.io and GitHub APIs
 */
export class NpmAdapter implements EcosystemAdapter {
  private npmsClient: NpmsClient;
  private githubClient: GithubClient;

  constructor() {
    this.npmsClient = new NpmsClient();
    this.githubClient = new GithubClient();
  }

  /**
   * Fetch package statistics from all sources
   */
  async fetch(request: PkgCompareRequest): Promise<PackageStats> {
    const npmsData = await this.npmsClient.fetchPackage(request.packageName);

    const stats: PackageStats = {
      name: npmsData.name,
      description: npmsData.description || null,
      version: npmsData.version,
      homepage: npmsData.links.homepage,
      repository: npmsData.links.repository,
      quality: npmsData.score?.detail?.quality,
      popularity: npmsData.score?.detail?.popularity,
      maintenance: npmsData.score?.detail?.maintenance,
      lastPublish: npmsData.time,
    };

    stats.npm = {
      dependencies: Object.keys(npmsData.dependencies || {}),
      devDependencies: Object.keys(npmsData.devDependencies || {}),
      peerDependencies: npmsData.peerDependencies || {},
      license: npmsData.license,
      size: 0,
      keywords: npmsData.keywords || [],
    };

    if (npmsData.links.repository) {
      try {
        const githubRepo = await this.githubClient.fetchRepository(npmsData.links.repository);

        stats.stars = githubRepo.stargazers_count;
        stats.forks = githubRepo.forks_count;
        stats.openIssues = githubRepo.open_issues_count;

        stats.github = {
          stars: githubRepo.stargazers_count,
          forks: githubRepo.forks_count,
          openIssues: githubRepo.open_issues_count,
          subscribers: githubRepo.subscribers_count,
          createdAt: githubRepo.created_at,
          updatedAt: githubRepo.updated_at,
          pushedAt: githubRepo.pushed_at,
          defaultBranch: githubRepo.default_branch,
          readme: null,
          homepageUrl: githubRepo.homepage || '',
        };

        const readme = await this.githubClient.fetchReadme(npmsData.links.repository);
        if (readme) {
          stats.github.readme = this.base64ToString(readme.content);
        }
      } catch (error) {
        console.warn('Failed to fetch GitHub data:', error);
      }
    }

    return stats;
  }

  /**
   * Check if adapter supports the ecosystem
   */
  supports(ecosystem: string): boolean {
    return ecosystem === 'npm';
  }

  /**
   * Convert base64 to string
   */
  private base64ToString(base64: string): string {
    const decoded = atob(base64);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }
}

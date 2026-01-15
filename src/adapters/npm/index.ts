import type {
  EcosystemAdapter,
  PeekPackageRequest,
  PackageStats,
  NpmSpecificStats,
  GithubSpecificStats,
} from "@/types/adapter";
import { NpmsClient } from "./npms-client";
import { GithubClient } from "./github-client";

/**
 * npm data only (from npms.io) - excludes GitHub API calls
 */
export interface NpmDataResult {
  name: string;
  description: string | null;
  version: string;
  homepage: string | null;
  repository: string | null;
  quality: number;
  popularity: number;
  maintenance: number;
  finalScore: number;
  weeklyDownloads: number | undefined;
  dependentsCount: number;
  npm: NpmSpecificStats;
  // Author and maintainers
  author: {
    name: string;
    email?: string;
    url?: string;
  } | null;
  maintainers: Array<{
    name: string;
    email?: string;
  }>;
  // Links
  links: {
    npm: string;
    homepage: string | null;
    repository: string | null;
    bugs: string | null;
  };
  // Detailed evaluation scores
  evaluation: {
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
  // GitHub data from npms.io (cached, not rate-limited)
  githubFromNpms?: {
    stars: number;
    forks: number;
    openIssues: number;
    subscribers: number;
  };
}

/**
 * GitHub data only (from GitHub API) - rate-limited
 */
export interface GithubDataResult {
  github: GithubSpecificStats;
  stars: number;
  forks: number;
  openIssues: number;
}

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
   * Fetch npm data only (from npms.io)
   * This includes cached GitHub stats from npms.io but not real-time GitHub API data
   */
  async fetchNpmData(packageName: string): Promise<NpmDataResult> {
    const npmsData = await this.npmsClient.fetchPackage(packageName);

    const { collected, score, evaluation } = npmsData;
    const { metadata, npm: npmData, github: githubData } = collected;
    const { links } = metadata;

    const result: NpmDataResult = {
      name: metadata.name || packageName,
      description: metadata.description ?? null,
      version: metadata.version || "0.0.0",
      homepage: links.homepage ?? null,
      repository: links.repository ?? null,
      // Convert 0-1 scores to 0-100 percentages
      quality: Math.round(score.detail.quality * 100),
      popularity: Math.round(score.detail.popularity * 100),
      maintenance: Math.round(score.detail.maintenance * 100),
      finalScore: Math.round(score.final * 100),
      // Index 1 is weekly downloads, index 0 is daily
      weeklyDownloads: npmData.downloads[1]?.count,
      dependentsCount: npmData.dependentsCount,
      npm: {
        dependencies: Object.keys(metadata.dependencies ?? {}),
        devDependencies: Object.keys(metadata.devDependencies ?? {}),
        peerDependencies: metadata.peerDependencies ?? {},
        license: metadata.license || "UNKNOWN",
        size: 0,
        keywords: metadata.keywords ?? [],
      },
      // Author and maintainers
      author: metadata.author ?? null,
      maintainers: metadata.maintainers
        .map((m) => ({
          name: m.name || m.username || "",
          email: m.email,
        }))
        .filter((m) => m.name),
      // Links
      links: {
        npm: links.npm,
        homepage: links.homepage ?? null,
        repository: links.repository ?? null,
        bugs: links.bugs ?? null,
      },
      // Detailed evaluation scores (convert 0-1 to 0-100)
      evaluation: {
        quality: {
          carefulness: Math.round(evaluation.quality.carefulness * 100),
          tests: Math.round(evaluation.quality.tests * 100),
          health: Math.round(evaluation.quality.health * 100),
          branding: Math.round(evaluation.quality.branding * 100),
        },
        popularity: {
          communityInterest: Math.round(
            evaluation.popularity.communityInterest * 100,
          ),
          downloadsCount: Math.round(
            evaluation.popularity.downloadsCount * 100,
          ),
          downloadsAcceleration: Math.round(
            evaluation.popularity.downloadsAcceleration * 100,
          ),
          dependentsCount: Math.round(
            evaluation.popularity.dependentsCount * 100,
          ),
        },
        maintenance: {
          releasesFrequency: Math.round(
            evaluation.maintenance.releasesFrequency * 100,
          ),
          commitsFrequency: Math.round(
            evaluation.maintenance.commitsFrequency * 100,
          ),
          openIssues: Math.round(evaluation.maintenance.openIssues * 100),
          issuesDistribution: Math.round(
            evaluation.maintenance.issuesDistribution * 100,
          ),
        },
      },
    };

    // Include GitHub data from npms.io if available (cached, not rate-limited)
    if (githubData) {
      result.githubFromNpms = {
        stars: githubData.starsCount,
        forks: githubData.forksCount,
        openIssues: githubData.issues.openCount,
        subscribers: githubData.subscribersCount,
      };
    }

    return result;
  }

  /**
   * Fetch GitHub data only (from GitHub API)
   * This is rate-limited (60 req/hr unauthenticated)
   */
  async fetchGithubData(
    repositoryUrl: string,
  ): Promise<GithubDataResult | null> {
    const githubRepo = await this.githubClient.fetchRepository(repositoryUrl);

    if (githubRepo === null) {
      return null;
    }

    const github: GithubSpecificStats = {
      stars: githubRepo.stargazers_count,
      forks: githubRepo.forks_count,
      openIssues: githubRepo.open_issues_count,
      subscribers: githubRepo.subscribers_count,
      createdAt: githubRepo.created_at,
      updatedAt: githubRepo.updated_at,
      pushedAt: githubRepo.pushed_at,
      defaultBranch: githubRepo.default_branch,
      readme: null,
      homepageUrl: githubRepo.homepage || "",
      language: githubRepo.language,
      size: githubRepo.size,
    };

    // Fetch README
    const readme = await this.githubClient.fetchReadme(repositoryUrl);
    if (readme) {
      github.readme = this.base64ToString(readme.content);
    }

    return {
      github,
      stars: githubRepo.stargazers_count,
      forks: githubRepo.forks_count,
      openIssues: githubRepo.open_issues_count,
    };
  }

  /**
   * Fetch package statistics from all sources (legacy combined method)
   */
  async fetch(request: PeekPackageRequest): Promise<PackageStats> {
    const npmData = await this.fetchNpmData(request.packageName);

    const stats: PackageStats = {
      name: npmData.name,
      description: npmData.description,
      version: npmData.version,
      homepage: npmData.homepage,
      repository: npmData.repository,
      quality: npmData.quality,
      popularity: npmData.popularity,
      maintenance: npmData.maintenance,
      weeklyDownloads: npmData.weeklyDownloads,
      npm: npmData.npm,
    };

    // Use GitHub data from npms.io as fallback
    if (npmData.githubFromNpms) {
      stats.stars = npmData.githubFromNpms.stars;
      stats.forks = npmData.githubFromNpms.forks;
      stats.openIssues = npmData.githubFromNpms.openIssues;

      stats.github = {
        stars: npmData.githubFromNpms.stars,
        forks: npmData.githubFromNpms.forks,
        openIssues: npmData.githubFromNpms.openIssues,
        subscribers: npmData.githubFromNpms.subscribers,
      };
    }

    // Try to fetch additional data from GitHub API if repository URL exists
    if (npmData.repository) {
      const githubData = await this.fetchGithubData(npmData.repository);

      if (githubData !== null) {
        stats.stars = githubData.stars;
        stats.forks = githubData.forks;
        stats.openIssues = githubData.openIssues;
        stats.github = githubData.github;
      }
    }

    return stats;
  }

  /**
   * Check if adapter supports the ecosystem
   */
  supports(ecosystem: string): boolean {
    return ecosystem === "npm";
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

/**
 * npms.io API response for single package
 * Endpoint: GET https://api.npms.io/v2/package/{package-name}
 */
export interface NpmsPackageResponse {
  analyzedAt: string;
  collected: {
    metadata: {
      name: string;
      version: string;
      description: string | null;
      keywords: string[];
      license: string;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
      peerDependencies: Record<string, string>;
      links: {
        npm: string;
        homepage: string | null;
        repository: string | null;
        bugs: string | null;
      };
      author: {
        name: string;
        email?: string;
        url?: string;
      } | null;
      maintainers: Array<{
        name: string;
        email?: string;
      }>;
    };
    npm: {
      downloads: Array<{
        from: string;
        to: string;
        count: number;
      }>;
      dependentsCount: number;
      starsCount: number;
    };
    github?: {
      starsCount: number;
      forksCount: number;
      subscribersCount: number;
      issues: {
        count: number;
        openCount: number;
        distribution: Record<string, number>;
        isDisabled: boolean;
      };
      commits: Array<{
        from: string;
        to: string;
        count: number;
      }>;
    };
  };
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
  score: {
    final: number;
    detail: {
      quality: number;
      popularity: number;
      maintenance: number;
    };
  };
}

/**
 * GitHub repository response
 */
export interface GithubRepoResponse {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  size: number;
}

/**
 * README content from GitHub
 */
export interface GithubReadmeResponse {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content: string;
  encoding: string;
}

/**
 * npms.io search suggestions response
 * Endpoint: GET https://api.npms.io/v2/search/suggestions?q={query}
 */
export type NpmsSearchResponse = Array<{
  package: {
    name: string;
    version: string;
    description: string;
    author: string;
    date: string;
    keywords: string[];
    links: {
      npm: string;
      homepage: string | null;
      repository: string | null;
      bugs: string | null;
    };
  };
  score: {
    final: number;
    detail: {
      quality: number;
      popularity: number;
      maintenance: number;
    };
  };
  searchScore: number;
  highlight: string;
}>;

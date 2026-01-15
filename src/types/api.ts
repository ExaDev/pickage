/**
 * npms.io API response for single package
 * Endpoint: GET https://api.npms.io/v2/package/{package-name}
 */
export interface NpmsPackageResponse {
  name: string;
  version: string;
  description: string;
  homepage: string;
  repository: {
    type: string;
    url: string;
  } | null;
  keywords: string[];
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
  license: string;
  maintainers: Array<{
    name: string;
    email?: string;
  }>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  // Enriched data from npms.io analysis
  score: {
    final: number;
    detail: {
      quality: number;
      popularity: number;
      maintenance: number;
    };
  };
  time: string;
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

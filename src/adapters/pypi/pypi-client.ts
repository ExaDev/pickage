/**
 * PyPI API client for fetching Python package information
 * Uses the JSON API at https://pypi.org/pypi/
 * Search functionality uses both full and popular PyPI packages with fallback
 */

import {
  pypiPackagesClient,
  PopularPackage,
  FullPackage,
} from "./pypi-packages-client";

export interface PyPiSearchResult {
  name: string;
  version?: string; // Not available from package list search
  summary?: string; // Not available from package list search
}

export interface PyPiPackageData {
  info: {
    name: string;
    version: string;
    summary: string | null;
    home_page: string | null;
    author: string | null;
    author_email: string | null;
    license: string | null;
    project_urls: Record<string, string> | null;
    requires_dist: string[] | null;
    requires_python: string | null;
    classifiers: string[] | null;
  };
  releases: Record<string, Array<{ upload_time_iso_8601: string }>>;
  urls: Array<{
    upload_time_iso_8601: string;
  }>;
}

export class PyPiClient {
  private baseUrl = "https://pypi.org/pypi";
  private timeout = 10000; // 10 seconds

  async fetchPackage(packageName: string): Promise<PyPiPackageData> {
    const url = `${this.baseUrl}/${encodeURIComponent(packageName)}/json`;

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Package not found: ${packageName}`);
        }
        throw new Error(
          `PyPI API error: ${String(response.status)} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as PyPiPackageData;
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch package from PyPI: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Search for PyPI packages using either full or popular dataset
   * Note: This method now requires the packages array to be passed in
   * The packages should be fetched from React Query cache via usePyPiPackages()
   *
   * @param packages The packages array from React Query (FullPackage[] | PopularPackage[])
   * @param query Search query string
   * @returns Array of search results (name only - use fetchPackage() for details)
   */
  searchPackages(
    packages: (FullPackage | PopularPackage)[],
    query: string,
  ): PyPiSearchResult[] {
    const results = pypiPackagesClient.searchPackages(packages, query);

    // Return only the name - version and summary require fetchPackage()
    return results.map((result) => ({
      name: result.name,
    }));
  }
}

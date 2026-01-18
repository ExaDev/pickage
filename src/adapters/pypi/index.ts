import type {
  EcosystemAdapter,
  PickageRequest,
  PackageStats,
  PyPiSpecificStats,
} from "@/types/adapter";
import { PyPiClient } from "./pypi-client";

/**
 * PyPI ecosystem adapter implementing EcosystemAdapter interface
 * Fetches data from PyPI JSON API
 */
export class PyPiAdapter implements EcosystemAdapter {
  private pypiClient: PyPiClient;

  constructor() {
    this.pypiClient = new PyPiClient();
  }

  /**
   * Fetch package statistics from PyPI
   */
  async fetch(request: PickageRequest): Promise<PackageStats> {
    const packageData = await this.pypiClient.fetchPackage(request.packageName);

    const { info, releases } = packageData;

    // Get release dates to calculate publish frequency
    const releaseDates = Object.keys(releases)
      .map((version) => {
        const release = releases[version];
        if (release.length > 0) {
          return new Date(release[0].upload_time_iso_8601).getTime();
        }
        return null;
      })
      .filter((date): date is number => date !== null)
      .sort((a, b) => b - a);

    // Calculate last publish date
    const lastPublishDate =
      releaseDates.length > 0
        ? new Date(releaseDates[0]).toISOString()
        : undefined;

    // Parse dependencies from requires_dist
    const dependencies: string[] = [];
    if (info.requires_dist && Array.isArray(info.requires_dist)) {
      for (const dep of info.requires_dist) {
        // Extract package name from dependency string
        // Format is usually: "package-name (>=1.0.0)" or "package-name[extra] (>=1.0.0)"
        const match = dep.match(/^([a-zA-Z0-9._-]+)/);
        if (match && !match[1].startsWith("python")) {
          dependencies.push(match[1]);
        }
      }
    }

    // Extract homepage and repository URLs
    let homepage: string | null = info.home_page || null;
    let repository: string | null = null;

    // Check project_urls for repository
    if (info.project_urls) {
      repository =
        info.project_urls["Repository"] ||
        info.project_urls["repository"] ||
        info.project_urls["Source Code"] ||
        info.project_urls["source"] ||
        info.project_urls["Homepage"] ||
        null;

      // Use Homepage from project_urls if not set
      if (!homepage && info.project_urls["Homepage"]) {
        homepage = info.project_urls["Homepage"];
      }
    }

    // Calculate maintenance score based on release frequency
    // More recent releases = higher maintenance score (0-100)
    let maintenanceScore = 50; // Default to 50
    if (releaseDates.length > 0) {
      const newestRelease = releaseDates[0];
      const now = Date.now();
      const daysOld = (now - newestRelease) / (1000 * 60 * 60 * 24);

      if (daysOld < 30) {
        maintenanceScore = 95; // Very active
      } else if (daysOld < 90) {
        maintenanceScore = 85; // Active
      } else if (daysOld < 180) {
        maintenanceScore = 70; // Moderately maintained
      } else if (daysOld < 365) {
        maintenanceScore = 50; // Maintenance concerns
      } else {
        maintenanceScore = 30; // Likely abandoned
      }
    }

    // Get the latest upload time
    const latestUpload =
      packageData.urls.length > 0
        ? packageData.urls[0].upload_time_iso_8601
        : null;

    // PyPI-specific stats
    const pypiStats: PyPiSpecificStats = {
      requiresPython: info.requires_python || null,
      dependencies,
      license: info.license || null,
      classifiers: info.classifiers || [],
      uploads: Object.keys(releases).length,
      upload_time: latestUpload,
    };

    const stats: PackageStats = {
      name: info.name || request.packageName, // Use canonical name from PyPI
      description: info.summary || null,
      version: info.version || "unknown",
      homepage,
      repository,
      maintenance: maintenanceScore,
      lastPublish: lastPublishDate,
      author:
        info.author && info.author_email
          ? {
              name: info.author,
              email: info.author_email,
            }
          : info.author
            ? { name: info.author }
            : undefined,
      links: {
        pypi: `https://pypi.org/project/${info.name || request.packageName}/`,
        homepage,
        repository,
        bugs: repository ? `${repository}/issues` : null,
      },
      pypi: pypiStats,
    };

    console.log(
      "[PyPI Adapter] Returning stats:",
      JSON.stringify(stats, null, 2),
    );
    return stats;
  }

  /**
   * Check if adapter supports the ecosystem
   */
  supports(ecosystem: string): boolean {
    return ecosystem === "pypi";
  }
}

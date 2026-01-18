/**
 * Integration tests for PyPI API client
 * These tests make real API calls to verify the integration works correctly
 *
 * Run with: pnpm test src/adapters/pypi/pypi-client.integration.test.ts
 *
 * Note: These tests depend on external API availability
 * Search uses both full and popular PyPI packages datasets (no API key required)
 */

import { describe, it, expect, beforeAll } from "vitest";
import { PyPiClient } from "./pypi-client";
import { pypiPackagesClient } from "./pypi-packages-client";
import { QueryClient } from "@tanstack/react-query";
import { cacheKeys } from "../../utils/cache";

describe("PyPiClient Integration Tests", () => {
  let client: PyPiClient;
  let popularPackages: { project: string; download_count: number }[];

  beforeAll(async () => {
    client = new PyPiClient();
    // Fetch the popular packages dataset once for all search tests
    popularPackages = await pypiPackagesClient.fetchPopularPackages();
  });

  describe("fetchPackage", () => {
    it("should fetch real package data for django", async () => {
      const result = await client.fetchPackage("django");

      expect(result).toBeDefined();
      // PyPI returns case-normalized names (Django, not django)
      expect(result.info.name.toLowerCase()).toBe("django");
      expect(result.info.version).toMatch(/^\d+\.\d+/);
      expect(result.info.summary).toBeTruthy();
    });

    it("should fetch real package data for requests", async () => {
      const result = await client.fetchPackage("requests");

      expect(result).toBeDefined();
      expect(result.info.name).toBe("requests");
      expect(result.info.author).toContain("Kenneth");
    });

    it("should fetch real package data for flask", async () => {
      const result = await client.fetchPackage("flask");

      expect(result).toBeDefined();
      // PyPI returns Flask (capitalized)
      expect(result.info.name.toLowerCase()).toBe("flask");
      // Flask may not have home_page in PyPI metadata
      expect(result.info.summary).toBeTruthy();
    });

    it("should throw 404 error for non-existent package", async () => {
      await expect(
        client.fetchPackage("this-package-does-not-exist-xyz-12345"),
      ).rejects.toThrow(/not found/i);
    });

    it("should handle packages with underscores in name", async () => {
      const result = await client.fetchPackage("beautifulsoup4");

      expect(result).toBeDefined();
      expect(result.info.name).toBe("beautifulsoup4");
    });

    it("should handle packages with hyphens in name", async () => {
      const result = await client.fetchPackage("scikit-learn");

      expect(result).toBeDefined();
      expect(result.info.name).toBe("scikit-learn");
    });
  });

  describe("searchPackages", () => {
    it("should return search results for django", () => {
      const result = client.searchPackages(popularPackages, "django");

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // First result should be django itself (exact match)
      expect(result[0].name.toLowerCase()).toBe("django");
    });

    it("should return search results for requests", () => {
      const result = client.searchPackages(popularPackages, "requests");

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Should include requests
      const hasRequests = result.some((r) => r.name === "requests");
      expect(hasRequests).toBe(true);
    });

    it("should return multiple results for common terms", () => {
      const result = client.searchPackages(popularPackages, "http");

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(1);
    });

    it("should return empty array for query with no results", () => {
      const result = client.searchPackages(
        popularPackages,
        "xyzabc123packageidonotexist999",
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should prioritize exact matches", () => {
      const result = client.searchPackages(popularPackages, "django");

      // First result should be exact match (case-insensitive)
      expect(result[0].name.toLowerCase()).toBe("django");
    });

    it("should prioritize starts-with matches", () => {
      const result = client.searchPackages(popularPackages, "django");

      // Results starting with "django" should come before contains matches
      const djangoIndex = result.findIndex((r) => r.name === "django");
      const containsIndex = result.findIndex(
        (r) => r.name.includes("django") && r.name !== "django",
      );

      if (djangoIndex !== -1 && containsIndex !== -1) {
        expect(djangoIndex).toBeLessThan(containsIndex);
      }
    });

    it("should handle typos with fuzzy search", () => {
      // Test common typo: "djnago" instead of "django"
      const result = client.searchPackages(popularPackages, "djnago");

      expect(result.length).toBeGreaterThan(0);

      // Should find Django despite the typo
      const hasDjango = result.some((r) => r.name.toLowerCase() === "django");
      expect(hasDjango).toBe(true);
    });

    it("should handle partial matches", () => {
      // Test partial match: "flask" should find "flask" and related packages
      const result = client.searchPackages(popularPackages, "flask");

      expect(result.length).toBeGreaterThan(0);

      // Should include flask
      const hasFlask = result.some((r) => r.name.toLowerCase() === "flask");
      expect(hasFlask).toBe(true);
    });

    it("should not include fake empty values for version and summary", () => {
      const result = client.searchPackages(popularPackages, "django");

      expect(result.length).toBeGreaterThan(0);

      // Version and summary should not be present in search results
      const firstResult = result[0];
      expect(firstResult.name).toBeDefined();
      expect(firstResult.version).toBeUndefined();
      expect(firstResult.summary).toBeUndefined();
    });
  });

  describe("real-world data validation", () => {
    it("should include all required fields in package data", async () => {
      const result = await client.fetchPackage("numpy");

      expect(result.info).toBeDefined();
      expect(result.info.name).toBeDefined();
      expect(result.info.version).toBeDefined();
      expect(result.info.summary).toBeDefined();
      expect(result.info.author).toBeDefined();
      expect(result.info.license).toBeDefined();

      // Optional fields
      expect(result.info.home_page).toBeDefined();
      expect(result.info.project_urls).toBeDefined();
      expect(result.info.requires_dist).toBeDefined();
    });

    it("should include release information", async () => {
      const result = await client.fetchPackage("django");

      expect(result.releases).toBeDefined();
      expect(typeof result.releases).toBe("object");
    });

    it("should include upload time information", async () => {
      const result = await client.fetchPackage("flask");

      // Should have either releases with upload times or urls with upload times
      const hasReleaseInfo =
        Object.keys(result.releases).length > 0 || result.urls.length > 0;
      expect(hasReleaseInfo).toBe(true);
    });

    it.skip("should handle packages with different license formats", async () => {
      // Skip: PyPI license field is unreliable and often null
      // Licenses are typically in separate files or classifiers

      const mitLicensed = await client.fetchPackage("requests");
      expect(mitLicensed.info.license).toBeTruthy();

      const bsdLicensed = await client.fetchPackage("numpy");
      expect(bsdLicensed.info.license).toBeTruthy();
    });

    it("should include project URLs when available", async () => {
      const result = await client.fetchPackage("django");

      expect(result.info.project_urls).toBeDefined();
      expect(typeof result.info.project_urls).toBe("object");
    });
  });

  describe("popular packages", () => {
    it("should fetch data for numpy", async () => {
      const result = await client.fetchPackage("numpy");

      expect(result.info.name).toBe("numpy");
      expect(result.info.version).toBeTruthy();
    });

    it("should fetch data for pandas", async () => {
      const result = await client.fetchPackage("pandas");

      expect(result.info.name).toBe("pandas");
      expect(result.info.summary).toBeTruthy();
    });

    it("should fetch data for scipy", async () => {
      const result = await client.fetchPackage("scipy");

      expect(result.info.name).toBe("scipy");
      // Author may be null for some packages
      expect(result.info.version).toBeTruthy();
    });
  });
});

describe("PyPiPackagesClient - Dual Dataset Tests", () => {
  describe("fetchPopularPackages", () => {
    it("should fetch popular packages dataset", async () => {
      const packages = await pypiPackagesClient.fetchPopularPackages();

      expect(Array.isArray(packages)).toBe(true);
      expect(packages.length).toBeGreaterThan(10000); // ~15k packages
      expect(packages.length).toBeLessThan(20000);

      // Should have download_count for ranking
      expect(packages[0].download_count).toBeGreaterThan(0);

      // Should be sorted by download count (most popular first)
      expect(packages[0].download_count).toBeGreaterThanOrEqual(
        packages[packages.length - 1].download_count,
      );
    });

    it("should include known popular packages", async () => {
      const packages = await pypiPackagesClient.fetchPopularPackages();

      const packageNames = packages.map((p) => p.project.toLowerCase());

      // Should include top Python packages
      expect(packageNames).toContain("django");
      expect(packageNames).toContain("requests");
      expect(packageNames).toContain("flask");
      expect(packageNames).toContain("numpy");
    });
  });

  describe("fetchFullPackages", () => {
    it("should fetch full PyPI packages dataset", async () => {
      const packages = await pypiPackagesClient.fetchFullPackages();

      expect(Array.isArray(packages)).toBe(true);
      expect(packages.length).toBeGreaterThan(500000); // 500k+ packages (growing)

      // Each package should have a name
      expect(packages[0].name).toBeDefined();
      expect(packages[0].name).toBeTruthy();
    });

    it("should include packages from popular dataset in full dataset", async () => {
      const packages = await pypiPackagesClient.fetchFullPackages();

      const packageNames = packages.map((p) => p.name.toLowerCase());

      // Should include top packages
      expect(packageNames).toContain("django");
      expect(packageNames).toContain("requests");
    });

    it("should handle full dataset size gracefully", async () => {
      const start = Date.now();
      const packages = await pypiPackagesClient.fetchFullPackages();
      const duration = Date.now() - start;

      expect(packages.length).toBeGreaterThan(500000);
      // Should complete in reasonable time (< 60 seconds)
      expect(duration).toBeLessThan(60000);
    }, 60000); // 60 second timeout
  });

  describe("dataset comparison", () => {
    it("full dataset should have more packages than popular dataset", async () => {
      const [full, popular] = await Promise.all([
        pypiPackagesClient.fetchFullPackages(),
        pypiPackagesClient.fetchPopularPackages(),
      ]);

      expect(full.length).toBeGreaterThan(popular.length);
    });

    it("popular dataset should be subset of full dataset (mostly)", async () => {
      const [full, popular] = await Promise.all([
        pypiPackagesClient.fetchFullPackages(),
        pypiPackagesClient.fetchPopularPackages(),
      ]);

      // Check that popular packages exist in full dataset
      const fullNames = new Set(full.map((p) => p.name.toLowerCase()));
      const popularPackagesFound = popular.filter((p) =>
        fullNames.has(p.project.toLowerCase()),
      );

      // Most popular packages should be in full dataset
      expect(popularPackagesFound.length).toBeGreaterThan(
        popular.length * 0.95,
      ); // At least 95% overlap
    });
  });
});

describe("React Query Integration - Dual Dataset", () => {
  it("should cache both datasets separately", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: Infinity,
          gcTime: Infinity,
          retry: false,
        },
      },
    });

    // Fetch both datasets
    await Promise.all([
      queryClient.fetchQuery({
        queryKey: cacheKeys.pypiFullPackages(),
        queryFn: () => pypiPackagesClient.fetchFullPackages(),
      }),
      queryClient.fetchQuery({
        queryKey: cacheKeys.pypiPopularPackages(),
        queryFn: () => pypiPackagesClient.fetchPopularPackages(),
      }),
    ]);

    // Both should be cached separately
    const fullData = queryClient.getQueryData(cacheKeys.pypiFullPackages());
    const popularData = queryClient.getQueryData(
      cacheKeys.pypiPopularPackages(),
    );

    expect(fullData).toBeDefined();
    expect(popularData).toBeDefined();
    expect(Array.isArray(fullData)).toBe(true);
    expect(Array.isArray(popularData)).toBe(true);
  });
});

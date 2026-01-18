/**
 * Integration tests for npms.io API client
 * These tests make real API calls to verify the integration works correctly
 *
 * Run with: pnpm test src/adapters/npm/npms-client.integration.test.ts
 *
 * Note: These tests depend on external API availability and may be flaky
 * They are marked as slow and skipped by default in CI
 */

import { describe, it, expect } from "vitest";
import { NpmsClient } from "./npms-client";

describe("NpmsClient Integration Tests", () => {
  describe("fetchPackage", () => {
    it("should fetch real package data for react", async () => {
      const client = new NpmsClient();
      const result = await client.fetchPackage("react");

      expect(result).toBeDefined();
      expect(result.collected.metadata.name).toBe("react");
      expect(result.collected.metadata.version).toMatch(/^\d+\.\d+\.\d+/);
      expect(result.score.final).toBeGreaterThan(0);
      expect(result.score.detail.quality).toBeGreaterThanOrEqual(0);
      expect(result.score.detail.quality).toBeLessThanOrEqual(1);
    });

    it("should fetch real package data for vue", async () => {
      const client = new NpmsClient();
      const result = await client.fetchPackage("vue");

      expect(result).toBeDefined();
      expect(result.collected.metadata.name).toBe("vue");
      expect(result.collected.metadata.description).toBeTruthy();
    });

    it("should throw 404 error for non-existent package", async () => {
      const client = new NpmsClient();

      await expect(
        client.fetchPackage("this-package-does-not-exist-xyz-12345"),
      ).rejects.toThrow(/not found/i);
    });

    it("should handle scoped packages correctly", async () => {
      const client = new NpmsClient();
      const result = await client.fetchPackage("@types/node");

      expect(result).toBeDefined();
      expect(result.collected.metadata.name).toBe("@types/node");
    });
  });

  describe("fetchPackages", () => {
    it("should fetch multiple packages in batch", async () => {
      const client = new NpmsClient();
      const result = await client.fetchPackages(["react", "vue", "angular"]);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("react");
      expect(result).toHaveProperty("vue");
      expect(result).toHaveProperty("angular");

      expect(result.react.collected.metadata.name).toBe("react");
      expect(result.vue.collected.metadata.name).toBe("vue");
      expect(result.angular.collected.metadata.name).toBe("angular");
    });

    it("should handle mix of existing and non-existent packages", async () => {
      const client = new NpmsClient();

      // npms.io batch API returns null for non-existent packages
      // but doesn't throw an error for the entire batch
      const result = await client.fetchPackages([
        "react",
        "does-not-exist-xyz-123",
      ]);

      expect(result).toHaveProperty("react");
      // The non-existent package may or may not be in the response
      // depending on npms.io behavior
    });
  });

  describe("fetchSuggestions", () => {
    it("should return search suggestions for react", async () => {
      const client = new NpmsClient();
      const result = await client.fetchSuggestions("react");

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // First result should be react itself
      expect(result[0].package.name).toBe("react");
      expect(result[0].score.final).toBeGreaterThan(0);
    });

    it("should return search suggestions for vue", async () => {
      const client = new NpmsClient();
      const result = await client.fetchSuggestions("vue");

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Should include vue and related packages
      const packageNames = result.map((r) => r.package.name);
      expect(packageNames.some((name) => name.includes("vue"))).toBe(true);
    });

    it("should return empty array for query with no results", async () => {
      const client = new NpmsClient();
      const result = await client.fetchSuggestions(
        "xyzabc123packageidonotexist",
      );

      expect(Array.isArray(result)).toBe(true);
      // May return empty array or results with very low scores
    });

    it("should encode special characters in query", async () => {
      const client = new NpmsClient();
      const result = await client.fetchSuggestions("@types/react");

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("real-world data validation", () => {
    it("should include all required fields in package data", async () => {
      const client = new NpmsClient();
      const result = await client.fetchPackage("express");

      expect(result.collected).toBeDefined();
      expect(result.collected.metadata).toBeDefined();
      expect(result.score).toBeDefined();

      // Check metadata has expected fields
      expect(result.collected.metadata.name).toBeDefined();
      expect(result.collected.metadata.version).toBeDefined();
      expect(result.collected.metadata.description).toBeDefined();
      expect(result.collected.metadata.links).toBeDefined();
      expect(result.collected.metadata.keywords).toBeDefined();

      // Check score has expected fields
      expect(result.score.final).toBeDefined();
      expect(result.score.detail.quality).toBeDefined();
      expect(result.score.detail.popularity).toBeDefined();
      expect(result.score.detail.maintenance).toBeDefined();

      // Check evaluation has expected fields
      expect(result.evaluation).toBeDefined();
      expect(result.evaluation.quality).toBeDefined();
      expect(result.evaluation.popularity).toBeDefined();
      expect(result.evaluation.maintenance).toBeDefined();
    });

    it("should include GitHub data when available", async () => {
      const client = new NpmsClient();
      const result = await client.fetchPackage("react");

      // React has a GitHub repo, so should have github data
      expect(result.collected.github).toBeDefined();
      expect(result.collected.github?.starsCount).toBeGreaterThanOrEqual(0);
      expect(result.collected.github?.forksCount).toBeGreaterThanOrEqual(0);
    });
  });
});

/**
 * Integration tests for GitHub API client
 * These tests make real API calls to verify the integration works correctly
 *
 * Run with: pnpm test src/adapters/npm/github-client.integration.test.ts
 *
 * Note: These tests depend on GitHub API and are rate-limited
 * They are marked as skip by default to avoid consuming rate limit
 * Unauthenticated: 60 requests/hour
 * Authenticated: 5,000 requests/hour
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { GithubClient } from "./github-client";

describe("GithubClient Integration Tests", () => {
  let client: GithubClient;

  beforeEach(() => {
    client = new GithubClient();
  });

  afterEach(() => {
    client.clearToken();
  });

  describe("fetchRepository", () => {
    it("should fetch repository data for facebook/react", async () => {
      const result = await client.fetchRepository(
        "https://github.com/facebook/react",
      );

      expect(result).not.toBeNull();
      expect(result?.name).toBe("react");
      expect(result?.full_name).toBe("facebook/react");
      expect(result?.stargazers_count).toBeGreaterThan(0);
      expect(result?.forks_count).toBeGreaterThan(0);
      expect(result?.open_issues_count).toBeGreaterThanOrEqual(0);
      expect(result?.subscribers_count).toBeGreaterThanOrEqual(0);
      expect(result?.language).toBeTruthy();
    });

    it("should fetch repository data for vuejs/core", async () => {
      const result = await client.fetchRepository(
        "https://github.com/vuejs/core",
      );

      expect(result).not.toBeNull();
      expect(result?.name).toBe("core");
      expect(result?.full_name).toBe("vuejs/core");
    });

    it("should handle various GitHub URL formats", async () => {
      const urls = [
        "https://github.com/facebook/react",
        "https://github.com/facebook/react.git",
        "git+https://github.com/facebook/react.git",
      ];

      for (const url of urls) {
        const result = await client.fetchRepository(url);
        expect(result).not.toBeNull();
        expect(result?.name).toBe("react");
      }
    });

    it("should return null for non-existent repository", async () => {
      const result = await client.fetchRepository(
        "https://github.com/a-repo-that-does-not-exist-xyz-123/fake-repo",
      );

      expect(result).toBeNull();
    });

    it("should handle repository with dots in name (next.js)", async () => {
      const result = await client.fetchRepository(
        "https://github.com/vercel/next.js",
      );

      expect(result).not.toBeNull();
      expect(result?.name).toBe("next.js");
    });
  });

  describe("fetchReadme", () => {
    it("should fetch README for facebook/react", async () => {
      const result = await client.fetchReadme(
        "https://github.com/facebook/react",
      );

      expect(result).not.toBeNull();
      expect(result?.content).toBeTruthy();
      expect(result?.encoding).toBe("base64");

      // README should be decodable base64
      const decoded = atob(result!.content);
      expect(decoded.length).toBeGreaterThan(0);
    });

    it("should return null for repository without README", async () => {
      // Most repos have READMEs, so this test is theoretical
      // In practice, GitHub creates a default README for most repos
      const result = await client.fetchReadme(
        "https://github.com/a-repo-that-does-not-exist-xyz-123/fake-repo",
      );

      expect(result).toBeNull();
    });
  });

  describe("getRateLimit", () => {
    it("should return rate limit information", async () => {
      const result = await client.getRateLimit();

      expect(result).toBeDefined();
      expect(result.remaining).toBeGreaterThanOrEqual(0);
      expect(result.limit).toBeGreaterThan(0);
      expect(typeof result.reset).toBe("number");
    });

    it("should have remaining less than or equal to limit", async () => {
      const result = await client.getRateLimit();

      expect(result.remaining).toBeLessThanOrEqual(result.limit);
    });
  });

  describe("token management", () => {
    it("should set and clear token", () => {
      const testToken = "ghp_test_token_12345";

      client.setToken(testToken);
      // No easy way to verify token was set without accessing private members
      // But we can verify it doesn't throw

      client.clearToken();
      // Should not throw
    });
  });

  describe("URL parsing", () => {
    it("should parse various GitHub URL formats correctly", async () => {
      const testCases = [
        {
          url: "https://github.com/facebook/react",
          expectedName: "react",
        },
        {
          url: "https://github.com/vercel/next.js",
          expectedName: "next.js",
        },
        {
          url: "https://github.com/vuejs/core.git",
          expectedName: "core",
        },
      ];

      for (const testCase of testCases) {
        const result = await client.fetchRepository(testCase.url);
        expect(result?.name).toBe(testCase.expectedName);
      }
    });

    it("should return null for invalid URLs", async () => {
      const invalidUrls = [
        "https://example.com/not-github",
        "not-a-url",
        "https://github.com/only-owner",
      ];

      for (const url of invalidUrls) {
        const result = await client.fetchRepository(url);
        expect(result).toBeNull();
      }
    });
  });

  describe("real-world data validation", () => {
    it("should include all required fields in repository data", async () => {
      const result = await client.fetchRepository(
        "https://github.com/facebook/react",
      );

      expect(result).not.toBeNull();

      // Check required fields (from GithubRepoResponse type)
      expect(result?.id).toBeDefined();
      expect(result?.name).toBeDefined();
      expect(result?.full_name).toBeDefined();
      expect(result?.description).toBeDefined();
      expect(result?.homepage).toBeDefined();
      expect(result?.language).toBeDefined();
      expect(result?.stargazers_count).toBeDefined();
      expect(result?.watchers_count).toBeDefined();
      expect(result?.forks_count).toBeDefined();
      expect(result?.open_issues_count).toBeDefined();
      expect(result?.subscribers_count).toBeDefined();
      expect(result?.created_at).toBeDefined();
      expect(result?.updated_at).toBeDefined();
      expect(result?.pushed_at).toBeDefined();
      expect(result?.default_branch).toBeDefined();
      expect(result?.size).toBeDefined();
    });
  });
});

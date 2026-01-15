import { test, expect } from "@playwright/test";

/**
 * Real API integration tests
 * These tests use actual API calls to verify end-to-end integration
 * Run sparingly to avoid rate limiting and flakiness
 */
test.describe("API Integration (Real API)", () => {
  // These tests are slower and may be flaky due to network conditions
  test.slow();

  test.beforeEach(async ({ page }) => {
    // No mocking - use real API
    await page.goto("/");
  });

  test("should fetch real package data from npms.io", async ({ page }) => {
    const input = page.getByRole("textbox", { name: "Package 1" });
    await input.fill("react");

    // Wait for autocomplete suggestions and click the "react" option
    // The option name includes both package name and description, so we match
    // on "react React" to distinguish from "react-dom", "react-router", etc.
    const reactOption = page.getByRole("option", { name: /^react React/ });
    await expect(reactOption).toBeVisible({ timeout: 15000 });
    await reactOption.click();

    // Should show real package data - allow extra time for real API calls
    // which may involve multiple requests (npms.io + GitHub API)
    await expect(page.getByRole("heading", { name: "react" })).toBeVisible({
      timeout: 30000,
    });
  });

  test("should handle non-existent package gracefully", async ({ page }) => {
    const input = page.getByRole("textbox", { name: "Package 1" });
    await input.fill("this-package-definitely-does-not-exist-xyz-12345");
    await input.press("Enter");

    // Should handle error gracefully (no crash)
    await page.waitForTimeout(3000);
    // Page should still be functional
    await expect(input).toBeVisible();
  });
});

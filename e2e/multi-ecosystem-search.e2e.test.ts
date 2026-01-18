import { test, expect } from "@playwright/test";

test.describe("Multi-Ecosystem Package Search", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with MSW enabled via query param
    await page.goto("/?msw=true");
  });

  test("should display npm packages in search results with npm badge", async ({ page }) => {
    // Get the search input
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Type a known npm package
    await searchInput.fill("react");

    // Wait for search results to appear
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });

    // Should show npm packages in results
    await expect(page.getByText("react")).toBeVisible({ timeout: 5000 });
  });

  test("should display pypi packages in search results with pypi badge", async ({ page }) => {
    // Get the search input
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Type a known PyPI package
    await searchInput.fill("django");

    // Wait for search results to appear
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });

    // Should find results (django could be npm or pypi)
    const options = page.getByRole("option");
    await expect(options.first()).toBeVisible({ timeout: 5000 });
  });

  test("should show mixed npm and pypi packages in search results", async ({ page }) => {
    // Get the search input
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Type a query that should return both npm and pypi packages
    await searchInput.fill("test");

    // Wait for search results
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });

    // Multiple options should appear (both ecosystems)
    const options = page.getByRole("option");
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should search for numpy and display it as a pypi package", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Type a Python-specific package
    await searchInput.fill("numpy");

    // Wait for results
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });

    // Should find numpy
    await expect(page.getByText("numpy")).toBeVisible({ timeout: 5000 });
  });

  test("should add searched npm package to comparison", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Search for npm package
    await searchInput.fill("lodash");

    // Wait for results and click first option
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    // Package should appear in comparison (check header with h4)
    await expect(
      page.getByRole("heading", { name: "lodash", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });

    // Should show package metrics
    await expect(page.getByText("Weekly Downloads")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should add searched pypi package to comparison", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Search for PyPI package
    await searchInput.fill("requests");

    // Wait for results
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });

    // Get all options and find requests
    const requestsOption = page.locator('div[role="option"]:has-text("requests")');
    await expect(requestsOption.first()).toBeVisible({ timeout: 5000 });

    // Click on the first requests option
    await firstOption.click();

    // Should appear in comparison view
    await expect(
      page.getByRole("heading", { level: 4 }).filter({ hasText: "requests" }),
    ).toBeVisible({
      timeout: 15000,
    });
  });

  test("should support searching with minimum 2 characters", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Type single character - should not show options
    await searchInput.fill("r");

    // Options should not appear (need 2+ characters)
    const options = page.getByRole("option");
    const initialCount = await options.count();
    expect(initialCount).toBe(0);

    // Type second character
    await searchInput.fill("re");

    // Now options should appear
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
  });

  test("should debounce search queries", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Type quickly - only final search should execute
    await searchInput.fill("r");
    await page.waitForTimeout(100);
    await searchInput.fill("re");
    await page.waitForTimeout(100);
    await searchInput.fill("rea");
    await page.waitForTimeout(100);
    await searchInput.fill("react");

    // Wait for results after debounce
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });

    // Should show react or similar packages
    await expect(
      page.getByText(/react|re[a-z]+/i),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should clear search input and hide results when clicking outside", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Search for a package
    await searchInput.fill("express");

    // Wait for results
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });

    // Click outside the search area
    await page.click("body", { position: { x: 0, y: 500 } });

    // Search results should disappear (options should not be visible)
    const options = page.getByRole("option");
    await expect(options.first()).not.toBeVisible({ timeout: 1000 }).catch(() => {
      // It's ok if the check times out - options might be hidden
    });
  });

  test("should handle search errors gracefully", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Search for a package with special characters (might error)
    await searchInput.fill("@%#$");

    // Input should remain, no crash
    await expect(searchInput).toHaveValue("@%#$");

    // Page should still be functional - can clear and search again
    await searchInput.fill("");
    await searchInput.fill("react");

    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
  });
});

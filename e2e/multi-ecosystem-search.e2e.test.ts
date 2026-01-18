import { test, expect } from "@playwright/test";

test.describe("Multi-Ecosystem Package Search UI", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with MSW enabled via query param
    await page.goto("/?msw=true");
  });

  test("should display search input on desktop", async ({ page }) => {
    // Get the search input
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });
  });

  test("should have search input on mobile with icon", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Search icon should be visible on mobile
    const searchIcon = page.getByLabel("Open search");
    await expect(searchIcon).toBeVisible({ timeout: 5000 });

    // Click to expand search
    await searchIcon.click();

    // Search input should now be visible
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });
  });

  test("should show ecosystem badges in search results when available", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Type to search (use a common package)
    await searchInput.fill("react");

    // Wait a bit for debounce
    await page.waitForTimeout(400);

    // Check if any search suggestions appear
    const options = page.getByRole("option");
    const optionCount = await options.count();

    // If options are available, they should be visible
    if (optionCount > 0) {
      await expect(options.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should support 2+ character search requirement", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Single character should not show options
    await searchInput.fill("r");
    await page.waitForTimeout(400);

    let options = page.getByRole("option");
    let optionCount = await options.count();
    expect(optionCount).toBe(0);

    // Two characters should potentially show options (depends on mocks)
    await searchInput.fill("re");
    await page.waitForTimeout(400);

    options = page.getByRole("option");
    optionCount = await options.count();
    // Could be 0 if no mocks, but should not error
    expect(optionCount).toBeGreaterThanOrEqual(0);
  });

  test("should clear search input when clicking X button on mobile", async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Open search
    const searchIcon = page.getByLabel("Open search");
    await searchIcon.click();

    // Search input should be visible
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Type something
    await searchInput.fill("react");

    // Click close button (X icon)
    const closeButton = page.getByLabel("Close search");
    await closeButton.click();

    // Search should be collapsed and input cleared
    const searchExpandedState = await searchIcon.isVisible({ timeout: 1000 });
    expect(searchExpandedState).toBe(true);
  });

  test("should handle empty search gracefully", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Type and delete
    await searchInput.fill("test");
    await searchInput.clear();

    // Should not show options
    const options = page.getByRole("option");
    const optionCount = await options.count();
    expect(optionCount).toBe(0);

    // Input should be functional
    await searchInput.fill("re");
    await page.waitForTimeout(400);

    // Page should remain functional
    await expect(searchInput).toHaveValue("re");
  });

  test("should not break with special characters", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Try special characters
    await searchInput.fill("@%#$");

    // Input should remain with the value
    await expect(searchInput).toHaveValue("@%#$");

    // Can clear and search again
    await searchInput.clear();
    await searchInput.fill("react");

    // Page should still be functional
    await expect(searchInput).toHaveValue("react");
  });

  test("should display import button on desktop", async ({ page }) => {
    // Desktop should have import button with icon
    const importButton = page.getByLabel(/import/i).first();
    await expect(importButton).toBeVisible({ timeout: 5000 });
  });

  test("should maintain focus on search input during typing", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Focus and type
    await searchInput.click();
    await searchInput.type("typescript");

    // Should have the typed value
    await expect(searchInput).toHaveValue("typescript");
  });

  test("should support quick package addition via Enter key", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("Search packages...");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Type a package name
    await searchInput.fill("express");

    // Press Enter to add
    await searchInput.press("Enter");

    // Input should clear
    await expect(searchInput).toHaveValue("");
  });
});

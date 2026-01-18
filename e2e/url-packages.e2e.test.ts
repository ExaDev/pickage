import { test, expect } from "@playwright/test";

test.describe("URL Packages Parameter", () => {
  test("should load pypi:django from URL parameter", async ({ page }) => {
    // Navigate directly to the URL with pypi:django package
    await page.goto("/?msw=true&packages=pypi:django");

    // Wait for page to load and packages to render
    await page.waitForTimeout(2000);

    // Django package card should be visible (looking for the package name in card header)
    await expect(page.locator("text=django").first()).toBeVisible({
      timeout: 5000,
    });

    // Should see npms.io Scores section (even though it's a PyPI package)
    // This indicates the comparison view loaded successfully
    await expect(page.locator('text="npms.io Scores"').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("should load npm:react from URL parameter", async ({ page }) => {
    // Test with npm package for comparison
    await page.goto("/?msw=true&packages=npm:react");

    // Wait for page to load
    await page.waitForTimeout(2000);

    // React package card should be visible
    await expect(page.locator("text=react").first()).toBeVisible({
      timeout: 5000,
    });

    // Should show npms.io Scores
    await expect(page.locator('text="npms.io Scores"').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("should load multiple packages from URL parameter", async ({ page }) => {
    // Test with multiple npm packages
    await page.goto(
      "/?msw=true&packages=npm:react,npm:vue,npm:svelte,npm:next,npm:preact,npm:angular",
    );

    // Wait for page to load
    await page.waitForTimeout(2000);

    // All packages should be visible in the comparison grid
    await expect(page.locator("text=react").first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator("text=vue").first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator("text=svelte").first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("should load mixed npm and pypi packages from URL", async ({ page }) => {
    // Test with mixed packages
    await page.goto(
      "/?msw=true&packages=npm:react,pypi:django,npm:express,pypi:numpy",
    );

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check that packages are loaded and visible
    await expect(page.locator("text=react").first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator("text=django").first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator("text=express").first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator("text=numpy").first()).toBeVisible({
      timeout: 5000,
    });
  });
});

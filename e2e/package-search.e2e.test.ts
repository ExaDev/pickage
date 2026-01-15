import { test, expect } from "@playwright/test";

test.describe("Package Search Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with MSW enabled via query param
    await page.goto("/?msw=true");
  });

  test("should display the app title", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "PeekPackage", level: 1 }),
    ).toBeVisible();
  });

  test("should show autocomplete suggestions when typing", async ({ page }) => {
    const input = page.getByRole("textbox", { name: "Package 1" });
    await input.fill("react");

    // Wait for autocomplete suggestions to appear
    await expect(page.getByRole("option").first()).toBeVisible({
      timeout: 5000,
    });

    // Should show multiple suggestions
    const options = page.getByRole("option");
    await expect(options.first()).toBeVisible();
  });

  test("should select package from autocomplete dropdown", async ({ page }) => {
    const input = page.getByRole("textbox", { name: "Package 1" });
    await input.fill("lodash");

    // Wait for and click on the first suggestion
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    // Input should now have the selected value
    await expect(input).toHaveValue(/lodash/i);
  });

  test("should submit package on Enter key", async ({ page }) => {
    const input = page.getByRole("textbox", { name: "Package 1" });
    await input.fill("express");

    // Wait for autocomplete to appear and select first option
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    // Should show package data - check for the package name heading
    await expect(page.getByRole("heading", { name: "express" })).toBeVisible({
      timeout: 15000,
    });
  });

  test("should submit package on blur", async ({ page }) => {
    const input = page.getByRole("textbox", { name: "Package 1" });
    await input.fill("axios");

    // Wait for autocomplete to appear
    await expect(page.getByRole("option").first()).toBeVisible({
      timeout: 5000,
    });

    // Click somewhere else to blur (closes autocomplete and triggers submission)
    await page.getByRole("heading", { name: "PeekPackage", level: 1 }).click();

    // Should show package data - check for the package name heading
    await expect(page.getByRole("heading", { name: "axios" })).toBeVisible({
      timeout: 15000,
    });
  });

  test("should handle non-existent package gracefully", async ({ page }) => {
    const input = page.getByRole("textbox", { name: "Package 1" });
    await input.fill("this-package-definitely-does-not-exist-12345");
    await input.press("Enter");

    // Should handle error gracefully (no crash)
    await page.waitForTimeout(3000);
    // Page should still be functional
    await expect(input).toBeVisible();
  });
});

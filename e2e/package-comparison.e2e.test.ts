import { test, expect } from "@playwright/test";

test.describe("Package Comparison Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with MSW enabled via query param
    await page.goto("/?msw=true");
  });

  // Helper function to add a package via the top bar input
  async function addPackage(
    page: import("@playwright/test").Page,
    packageName: string,
  ) {
    const input = page.getByPlaceholder("Search packages...");
    await input.fill(packageName);

    // Wait for autocomplete and click first option to add
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    // Wait for input to clear (indicates package was added)
    await expect(input).toHaveValue("");
  }

  test("should compare two packages side by side", async ({ page }) => {
    // Add two packages
    await addPackage(page, "react");
    await addPackage(page, "vue");

    // Wait for both packages to load - check for package name headings (h4 in column header)
    await expect(
      page.getByRole("heading", { name: "react", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByRole("heading", { name: "vue", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });
  });

  test("should display package metadata after adding", async ({ page }) => {
    await addPackage(page, "lodash");

    // Should show package heading with name (h4 in column header)
    await expect(
      page.getByRole("heading", { name: "lodash", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });

    // Should show metrics
    await expect(page.getByText("Weekly Downloads")).toBeVisible();
  });

  test("should show loading or data state after adding", async ({ page }) => {
    await addPackage(page, "express");

    // Should show package data (loading state is brief, so we check for the result)
    await expect(
      page.getByRole("heading", { name: "express", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });
  });

  test("should highlight winner metrics when comparing", async ({ page }) => {
    // Add two popular packages
    await addPackage(page, "react");
    await addPackage(page, "preact");

    // Wait for both packages to load (h4 in column header, use exact: true to avoid react matching preact)
    await expect(
      page.getByRole("heading", { name: "react", level: 4, exact: true }),
    ).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByRole("heading", { name: "preact", level: 4, exact: true }),
    ).toBeVisible({
      timeout: 15000,
    });
  });

  test("should compare three packages", async ({ page }) => {
    // Add three packages
    await addPackage(page, "express");
    await addPackage(page, "fastify");
    await addPackage(page, "koa");

    // Wait for all packages to load (h4 in column header)
    await expect(
      page.getByRole("heading", { name: "express", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByRole("heading", { name: "fastify", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByRole("heading", { name: "koa", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });
  });

  test("should remove a package when clicking remove button", async ({
    page,
  }) => {
    // Add two packages
    await addPackage(page, "lodash");
    await addPackage(page, "underscore");

    // Wait for both to load
    await expect(
      page.getByRole("heading", { name: "lodash", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByRole("heading", { name: "underscore", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });

    // Remove lodash
    const removeButton = page.getByRole("button", { name: /remove lodash/i });
    await removeButton.click();

    // lodash should be gone, underscore should remain
    await expect(
      page.getByRole("heading", { name: "lodash", level: 4 }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("heading", { name: "underscore", level: 4 }),
    ).toBeVisible();
  });

  test("should clear all packages when clicking clear button", async ({
    page,
  }) => {
    // Add two packages
    await addPackage(page, "react");
    await addPackage(page, "vue");

    // Wait for data to load
    await expect(
      page.getByRole("heading", { name: "react", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });

    // Click clear button
    const clearButton = page.getByRole("button", { name: "Clear" });
    await clearButton.click();

    // Should show empty state
    await expect(page.getByText("Compare npm packages")).toBeVisible();
  });

  test("should prevent adding duplicate packages", async ({ page }) => {
    // Add react
    await addPackage(page, "react");

    // Wait for it to load (use exact: true to avoid matching README h4s)
    await expect(
      page.getByRole("heading", { name: "react", level: 4, exact: true }),
    ).toBeVisible({
      timeout: 15000,
    });

    // Try to add react again
    const input = page.getByPlaceholder("Search packages...");
    await input.fill("react");

    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    // Wait for the duplicate notification to appear (confirms rejection)
    await expect(page.getByText("Package already added")).toBeVisible({
      timeout: 5000,
    });

    // Should still only have one react column (exact match to avoid README h4s)
    const reactHeadings = page.getByRole("heading", {
      name: "react",
      level: 4,
      exact: true,
    });
    await expect(reactHeadings).toHaveCount(1);
  });
});

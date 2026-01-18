import { test, expect } from "@playwright/test";

test.describe("Import Dependencies Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with MSW enabled via query param
    await page.goto("/?msw=true");
  });

  // Helper function to open import modal
  async function openImportModal(page: import("@playwright/test").Page) {
    // Click import button - try desktop version first
    const importButton = page.getByRole("button", { name: /import/i }).first();
    await expect(importButton).toBeVisible({ timeout: 5000 });
    await importButton.click();

    // Wait for modal to appear
    await expect(
      page.getByRole("heading", { name: "Import Dependencies" }),
    ).toBeVisible({ timeout: 5000 });
  }

  // Helper function to paste content in modal
  async function pasteContent(
    page: import("@playwright/test").Page,
    content: string,
  ) {
    const textarea = page.getByPlaceholder(
      /paste your package.json|requirements.txt/i,
    );
    await textarea.fill(content);

    // Click parse button
    const parseButton = page.getByRole("button", { name: "Parse Content" });
    await parseButton.click();
  }

  test("should open import modal when clicking import button", async ({ page }) => {
    // Mobile: Click search icon first to expand search
    const isMobile = (page.viewportSize()?.width ?? 1024) < 768;
    if (isMobile) {
      const searchIcon = page.getByLabel("Open search");
      if (await searchIcon.isVisible({ timeout: 1000 }).catch(() => false)) {
        await searchIcon.click();
      }
    }

    // Click import button
    const importButton = page.getByRole("button", { name: /import/i }).first();
    await expect(importButton).toBeVisible({ timeout: 5000 });
    await importButton.click();

    // Verify modal opened
    await expect(
      page.getByRole("heading", { name: "Import Dependencies" }),
    ).toBeVisible();
    await expect(page.getByText("Drag and drop a file here")).toBeVisible();
  });

  test("should detect package.json format and parse npm packages", async ({ page }) => {
    await openImportModal(page);

    const packageJsonContent = `{
  "name": "test-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}`;

    await pasteContent(page, packageJsonContent);

    // Wait for packages to be parsed
    await expect(page.getByText("Found 3 packages")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("package.json", { exact: true })).toBeVisible();

    // Verify ecosystem badges appear
    await expect(page.getByText("npm", { exact: true }).nth(1)).toBeVisible({
      timeout: 5000,
    });
  });

  test("should detect requirements.txt format and parse python packages", async ({ page }) => {
    await openImportModal(page);

    const requirementsContent = `# Python dependencies
requests==2.28.0
numpy>=1.21.0
django>=4.0
flask
pytest
# This is a comment
pandas
`;

    await pasteContent(page, requirementsContent);

    // Wait for packages to be parsed
    await expect(page.getByText(/Found \d+ packages?/)).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.getByText("requirements.txt", { exact: true }),
    ).toBeVisible();

    // Verify some Python packages are detected with pypi ecosystem
    await expect(page.getByText("pypi", { exact: true })).toBeVisible({
      timeout: 5000,
    });
  });

  test("should handle mixed format with ecosystem detection", async ({ page }) => {
    await openImportModal(page);

    // Mix of npm and python-like packages
    const mixedContent = `react
django
express
numpy
jest`;

    await pasteContent(page, mixedContent);

    // Wait for packages to be parsed
    await expect(page.getByText(/Found \d+ packages?/)).toBeVisible({
      timeout: 5000,
    });

    // Should detect both npm and pypi packages
    await expect(page.getByText("npm", { exact: true }).nth(1)).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("pypi", { exact: true })).toBeVisible({
      timeout: 5000,
    });
  });

  test("should import packages into comparison", async ({ page }) => {
    await openImportModal(page);

    const packageJsonContent = `{
  "dependencies": {
    "react": "^18.0.0",
    "vue": "^3.0.0"
  }
}`;

    await pasteContent(page, packageJsonContent);

    // Wait for packages to appear
    await expect(page.getByText("Found 2 packages")).toBeVisible({
      timeout: 5000,
    });

    // Click import button
    const importButton = page.getByRole("button", {
      name: "Import Packages",
    });
    await expect(importButton).toBeVisible({ timeout: 5000 });
    await importButton.click();

    // Wait for success notification
    await expect(page.getByText(/Imported 2 packages?/i)).toBeVisible({
      timeout: 5000,
    });

    // Modal should close
    await expect(
      page.getByRole("heading", { name: "Import Dependencies" }),
    ).not.toBeVisible({ timeout: 5000 });

    // Packages should appear in comparison (check for both packages)
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

  test("should show error when parsing invalid content", async ({ page }) => {
    await openImportModal(page);

    const invalidContent = `{invalid json content`;

    await pasteContent(page, invalidContent);

    // Should show error message
    await expect(page.getByText(/Error parsing content/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("should show error when no packages found", async ({ page }) => {
    await openImportModal(page);

    const emptyContent = `# Just comments
# No packages here`;

    await pasteContent(page, emptyContent);

    // Should show error message about no packages
    await expect(
      page.getByText(/No packages found in the content/i),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should disable import button until packages are parsed", async ({ page }) => {
    await openImportModal(page);

    // Import button should be hidden initially (wrapped in conditional)
    let importButton = page.getByRole("button", {
      name: "Import Packages",
    });
    const importButtonVisible = await importButton
      .isVisible({ timeout: 1000 })
      .catch(() => false);
    expect(importButtonVisible).toBe(false);

    // After pasting and parsing, import button should appear
    const packageJsonContent = `{
  "dependencies": {
    "lodash": "^4.0.0"
  }
}`;

    await pasteContent(page, packageJsonContent);

    // Now import button should be visible
    importButton = page.getByRole("button", {
      name: "Import Packages",
    });
    await expect(importButton).toBeVisible({ timeout: 5000 });
  });

  test("should display ecosystem badges with correct colors", async ({ page }) => {
    await openImportModal(page);

    const mixedContent = `react
django
numpy
express`;

    await pasteContent(page, mixedContent);

    // Wait for parsing
    await expect(page.getByText(/Found \d+ packages?/)).toBeVisible({
      timeout: 5000,
    });

    // Verify badges exist for different ecosystems
    const npmBadges = page.locator('div:has-text("npm")');
    const pypiBadges = page.locator('div:has-text("pypi")');

    await expect(npmBadges.first()).toBeVisible({ timeout: 5000 });
    await expect(pypiBadges.first()).toBeVisible({ timeout: 5000 });
  });

  test("should clear parsed packages when clicking clear", async ({ page }) => {
    await openImportModal(page);

    const packageJsonContent = `{
  "dependencies": {
    "react": "^18.0.0"
  }
}`;

    await pasteContent(page, packageJsonContent);

    // Wait for packages to appear
    await expect(page.getByText("Found 1 package")).toBeVisible({
      timeout: 5000,
    });

    // Click clear button (trash icon)
    const clearButton = page.getByRole("button", {
      name: /clear parsed packages/i,
    });
    await clearButton.click();

    // Packages section should disappear
    await expect(page.getByText("Found 1 package")).not.toBeVisible({
      timeout: 5000,
    });
  });

  test("should support yarn.lock format detection", async ({ page }) => {
    await openImportModal(page);

    const yarnLockContent = `# This file is automatically @generated by Yarn.
# DO NOT MANUALLY EDIT THIS FILE. Run \`yarn install\` to update this file in any workflow.

"@babel/code-frame@^7.12.13":
  version "7.16.7"
  resolved "https://registry.yarnpkg.com/@babel/code-frame/-/code-frame-7.16.7.tgz"

"react@^18.0.0":
  version "18.2.0"
  resolved "https://registry.yarnpkg.com/react/-/react-18.2.0.tgz"

"vue@^3.0.0":
  version "3.2.45"
  resolved "https://registry.yarnpkg.com/vue/-/vue-3.2.45.tgz"`;

    await pasteContent(page, yarnLockContent);

    // Wait for parsing
    await expect(page.getByText(/Found \d+ packages?/)).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("yarn.lock", { exact: true })).toBeVisible();
  });

  test("should support go.mod format detection", async ({ page }) => {
    await openImportModal(page);

    const goModContent = `module github.com/example/project

go 1.18

require (
    github.com/gin-gonic/gin v1.8.1
    github.com/lib/pq v1.10.6
)`;

    await pasteContent(page, goModContent);

    // Wait for parsing
    await expect(page.getByText(/Found \d+ packages?/)).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("go.mod", { exact: true })).toBeVisible();
  });

  test("should handle large dependency lists", async ({ page }) => {
    await openImportModal(page);

    // Create a large package list
    const packages = Array.from(
      { length: 50 },
      (_, i) => `package-${String(i)}`,
    ).join("\n");

    await pasteContent(page, packages);

    // Wait for parsing
    await expect(page.getByText(/Found 50 packages?/)).toBeVisible({
      timeout: 5000,
    });

    // Should show preview with "... and N more" message
    await expect(page.getByText(/and \d+ more/)).toBeVisible({ timeout: 5000 });
  });

  test("should close modal and reset state on import", async ({ page }) => {
    await openImportModal(page);

    const packageJsonContent = `{
  "dependencies": {
    "react": "^18.0.0"
  }
}`;

    await pasteContent(page, packageJsonContent);

    // Import packages
    const importButton = page.getByRole("button", {
      name: "Import Packages",
    });
    await importButton.click();

    // Wait for modal to close
    await expect(
      page.getByRole("heading", { name: "Import Dependencies" }),
    ).not.toBeVisible({ timeout: 5000 });

    // Open modal again - should be reset
    await openImportModal(page);

    // Textarea should be empty
    const textarea = page.getByPlaceholder(
      /paste your package.json|requirements.txt/i,
    );
    await expect(textarea).toHaveValue("");

    // Parsed packages section should not be visible
    const importButtonInModal = page.getByRole("button", {
      name: "Import Packages",
    });
    const isVisible = await importButtonInModal
      .isVisible({ timeout: 1000 })
      .catch(() => false);
    expect(isVisible).toBe(false);
  });
});

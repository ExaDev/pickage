import { useEffect, useCallback, useRef } from "react";

/**
 * URL format: ?packages=npm:package1,npm:package2
 * Each package is prefixed with its ecosystem (currently only npm supported)
 */

export interface UrlPackage {
  ecosystem: "npm";
  name: string;
}

/**
 * Parse packages from URL query parameter
 * Format: npm:package-name,npm:another-package
 */
export function parsePackagesFromUrl(): UrlPackage[] {
  const params = new URLSearchParams(window.location.search);
  const packagesParam = params.get("packages");

  if (!packagesParam) {
    return [];
  }

  return packagesParam
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => {
      // Parse ecosystem:package-name format
      const colonIndex = entry.indexOf(":");
      if (colonIndex === -1) {
        // Default to npm if no ecosystem specified
        return { ecosystem: "npm" as const, name: entry };
      }

      const ecosystem = entry.slice(0, colonIndex);
      const name = entry.slice(colonIndex + 1);

      // Currently only npm is supported
      if (ecosystem !== "npm") {
        console.warn(`Unsupported ecosystem: ${ecosystem}, defaulting to npm`);
        return { ecosystem: "npm" as const, name };
      }

      return { ecosystem: "npm" as const, name };
    })
    .filter((pkg) => pkg.name.length > 0);
}

/**
 * Serialize packages to URL query parameter format
 */
export function serializePackagesToUrl(packages: UrlPackage[]): string {
  return packages.map((pkg) => `${pkg.ecosystem}:${pkg.name}`).join(",");
}

/**
 * Update URL without triggering navigation
 * Uses replaceState to avoid polluting browser history
 */
export function updateUrlWithPackages(packages: UrlPackage[]): void {
  const url = new URL(window.location.href);

  if (packages.length === 0) {
    url.searchParams.delete("packages");
  } else {
    url.searchParams.set("packages", serializePackagesToUrl(packages));
  }

  window.history.replaceState({}, "", url.toString());
}

/**
 * Hook to sync package state with URL
 * Returns initial packages from URL and a function to update URL
 */
export function useUrlSync(submittedPackages: string[]) {
  const isInitialMount = useRef(true);

  // Update URL when submitted packages change (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const urlPackages: UrlPackage[] = submittedPackages
      .filter((name) => name.trim().length > 0)
      .map((name) => ({ ecosystem: "npm" as const, name }));

    updateUrlWithPackages(urlPackages);
  }, [submittedPackages]);

  // Return function to manually trigger URL update
  const syncToUrl = useCallback((packages: string[]) => {
    const urlPackages: UrlPackage[] = packages
      .filter((name) => name.trim().length > 0)
      .map((name) => ({ ecosystem: "npm" as const, name }));

    updateUrlWithPackages(urlPackages);
  }, []);

  return { syncToUrl };
}

/**
 * Get initial packages from URL (call once on app load)
 */
export function getInitialPackagesFromUrl(): string[] {
  const urlPackages = parsePackagesFromUrl();
  return urlPackages.map((pkg) => pkg.name);
}

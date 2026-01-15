import { useEffect, useCallback, useRef } from "react";
import type { SortCriterion, SortField } from "@/types/sort";

/**
 * URL format: ?packages=npm:package1,npm:package2&sort=stars:desc,forks:asc
 * Each package is prefixed with its ecosystem (currently only npm supported)
 * Sort criteria is optional, format: field:direction,field:direction
 */

export interface UrlPackage {
  ecosystem: "npm";
  name: string;
}

// Valid sort fields for URL parsing validation
const VALID_SORT_FIELDS: SortField[] = [
  "finalScore",
  "quality",
  "popularity",
  "maintenance",
  "weeklyDownloads",
  "dependentsCount",
  "stars",
  "forks",
  "openIssues",
];

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
 * Parse sort criteria from URL query parameter
 * Format: field:direction,field:direction
 */
export function parseSortFromUrl(): SortCriterion[] {
  const params = new URLSearchParams(window.location.search);
  const sortParam = params.get("sort");

  if (!sortParam) {
    return [];
  }

  return sortParam
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => {
      const colonIndex = entry.indexOf(":");
      if (colonIndex === -1) {
        return null;
      }

      const fieldStr = entry.slice(0, colonIndex);
      const directionStr = entry.slice(colonIndex + 1);

      // Validate field
      if (!VALID_SORT_FIELDS.includes(fieldStr as SortField)) {
        console.warn(`Invalid sort field: ${fieldStr}`);
        return null;
      }

      // Validate direction
      if (directionStr !== "asc" && directionStr !== "desc") {
        console.warn(`Invalid sort direction: ${directionStr}`);
        return null;
      }

      return { field: fieldStr as SortField, direction: directionStr };
    })
    .filter((criterion): criterion is SortCriterion => criterion !== null);
}

/**
 * Serialize sort criteria to URL query parameter format
 */
export function serializeSortToUrl(criteria: SortCriterion[]): string {
  return criteria.map((c) => `${c.field}:${c.direction}`).join(",");
}

/**
 * Update URL and create browser history entry
 * Uses pushState to enable back/forward navigation for undo/redo
 * Manually constructs URL to avoid encoding colons and commas for readability
 */
export function updateUrlWithPackages(
  packages: UrlPackage[],
  sortCriteria: SortCriterion[] = [],
): void {
  const { origin, pathname } = window.location;
  const currentUrl = window.location.href;

  const params: string[] = [];

  if (packages.length > 0) {
    params.push(`packages=${serializePackagesToUrl(packages)}`);
  }

  if (sortCriteria.length > 0) {
    params.push(`sort=${serializeSortToUrl(sortCriteria)}`);
  }

  const newUrl =
    params.length > 0
      ? `${origin}${pathname}?${params.join("&")}`
      : `${origin}${pathname}`;

  // Only push if URL actually changed
  if (newUrl !== currentUrl) {
    window.history.pushState({}, "", newUrl);
  }
}

/**
 * Hook to sync package state with URL
 * Returns initial packages from URL and a function to update URL
 */
export function useUrlSync(
  submittedPackages: string[],
  sortCriteria: SortCriterion[] = [],
) {
  const isInitialMount = useRef(true);

  // Update URL when submitted packages or sort criteria change (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const urlPackages: UrlPackage[] = submittedPackages
      .filter((name) => name.trim().length > 0)
      .map((name) => ({ ecosystem: "npm" as const, name }));

    updateUrlWithPackages(urlPackages, sortCriteria);
  }, [submittedPackages, sortCriteria]);

  // Return function to manually trigger URL update
  const syncToUrl = useCallback(
    (packages: string[], sort: SortCriterion[] = []) => {
      const urlPackages: UrlPackage[] = packages
        .filter((name) => name.trim().length > 0)
        .map((name) => ({ ecosystem: "npm" as const, name }));

      updateUrlWithPackages(urlPackages, sort);
    },
    [],
  );

  return { syncToUrl };
}

/**
 * Get initial packages from URL (call once on app load)
 * Deduplicates packages (case-insensitive, preserving first occurrence)
 */
export function getInitialPackagesFromUrl(): string[] {
  const urlPackages = parsePackagesFromUrl();
  const seen = new Set<string>();
  const uniquePackages: string[] = [];

  for (const pkg of urlPackages) {
    const lowerName = pkg.name.toLowerCase();
    if (!seen.has(lowerName)) {
      seen.add(lowerName);
      uniquePackages.push(pkg.name);
    }
  }

  return uniquePackages;
}

/**
 * Get initial sort criteria from URL (call once on app load)
 */
export function getInitialSortFromUrl(): SortCriterion[] {
  return parseSortFromUrl();
}

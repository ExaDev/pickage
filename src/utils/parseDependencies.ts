/**
 * Parse dependency files and extract package names
 * Supports: requirements.txt, package.json, package-lock.json, yarn.lock, go.mod, Gemfile, etc.
 */

interface ParseResult {
  packages: string[];
  format: string;
}

/**
 * Parse Python requirements.txt format
 * Supports: package-name, package-name==1.0.0, package-name>=1.0.0, etc.
 */
function parseRequirementsTxt(content: string): string[] {
  const packages: string[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    // Remove comments and trim whitespace
    const cleanedLine = line.split("#")[0].trim();

    // Skip empty lines and special directives
    if (!cleanedLine || cleanedLine.startsWith("-")) {
      continue;
    }

    // Extract package name (before any version specifiers or extras)
    // Supports: package-name, package-name[extra], package-name==1.0.0, etc.
    const packageMatch = cleanedLine.match(/^([a-zA-Z0-9._-]+)/);
    if (packageMatch) {
      packages.push(packageMatch[1]);
    }
  }

  return packages;
}

/**
 * Parse Node.js package.json format
 */
function parsePackageJson(content: string): string[] {
  try {
    const json = JSON.parse(content) as Record<string, unknown>;
    const packages: string[] = [];

    // Collect from dependencies, devDependencies, peerDependencies, optionalDependencies
    const depKeys = [
      "dependencies",
      "devDependencies",
      "peerDependencies",
      "optionalDependencies",
    ];

    for (const key of depKeys) {
      const deps = json[key];
      if (deps && typeof deps === "object") {
        packages.push(...Object.keys(deps as Record<string, unknown>));
      }
    }

    return packages;
  } catch {
    return [];
  }
}

/**
 * Parse Node.js package-lock.json format
 */
function parsePackageLockJson(content: string): string[] {
  try {
    const json = JSON.parse(content) as Record<string, unknown>;
    const packages: string[] = [];

    // Extract from packages object
    const packagesObj = json.packages;
    if (packagesObj && typeof packagesObj === "object") {
      for (const key of Object.keys(packagesObj)) {
        // Remove node_modules/ prefix and version info
        const packageName = key
          .replace(/^node_modules\//, "")
          .split("@")
          .slice(0, -1)
          .join("@");
        if (packageName && !packageName.includes("/node_modules")) {
          packages.push(packageName);
        }
      }
    }

    return [...new Set(packages)]; // Remove duplicates
  } catch {
    return [];
  }
}

/**
 * Parse yarn.lock format
 */
function parseYarnLock(content: string): string[] {
  const packages: Set<string> = new Set();
  const lines = content.split("\n");

  for (const line of lines) {
    // yarn.lock entries start with package names and version ranges
    // Example: "package-name@^1.0.0:"
    const match = line.match(/^("?.+?"?)@/);
    if (match) {
      let packageName = match[1].trim().replace(/"/g, "");
      // Handle scoped packages
      if (packageName.includes("@")) {
        packageName = packageName.split("@").slice(0, -1).join("@");
      }
      if (packageName) {
        packages.add(packageName);
      }
    }
  }

  return Array.from(packages);
}

/**
 * Parse Go mod format
 */
function parseGoMod(content: string): string[] {
  const packages: string[] = [];
  const lines = content.split("\n");
  let inRequire = false;

  for (const line of lines) {
    if (line.trim() === "require (") {
      inRequire = true;
      continue;
    }
    if (inRequire && line.trim() === ")") {
      inRequire = false;
      continue;
    }

    if (inRequire || line.startsWith("require ")) {
      // Extract package path (first part before space/version)
      const match = line.match(/require\s+([^\s]+)|^\s*([^\s]+)\s/);
      if (match) {
        const pkg = match[1] || match[2];
        if (pkg && pkg.includes("/")) {
          // Go packages are typically domain/user/repo
          packages.push(pkg);
        }
      }
    }
  }

  return packages;
}

/**
 * Parse Gemfile format (Ruby)
 */
function parseGemfile(content: string): string[] {
  const packages: string[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    // Match: gem 'package-name' or gem "package-name"
    const match = line.match(/^\s*gem\s+['"]([^'"]+)['"]/);
    if (match) {
      packages.push(match[1]);
    }
  }

  return packages;
}

/**
 * Parse Cargo.toml format (Rust)
 */
function parseCargoToml(content: string): string[] {
  try {
    // Simple regex-based parsing for dependencies sections
    const packages: string[] = [];
    const lines = content.split("\n");
    let inDependencies = false;

    for (const line of lines) {
      if (
        line.trim() === "[dependencies]" ||
        line.trim().startsWith("[dependencies.")
      ) {
        inDependencies = true;
        continue;
      }

      if (line.startsWith("[") && !line.startsWith("[dependencies")) {
        inDependencies = false;
        continue;
      }

      if (inDependencies) {
        // Match: package-name = "1.0.0" or package-name = { version = "1.0.0" }
        const match = line.match(/^([a-zA-Z0-9_-]+)\s*=/);
        if (match) {
          packages.push(match[1]);
        }
      }
    }

    return packages;
  } catch {
    return [];
  }
}

/**
 * Detect file format based on filename or content
 */
function detectFormat(content: string, filename?: string): string {
  if (filename) {
    if (filename.endsWith("requirements.txt")) return "requirements.txt";
    if (filename.endsWith("package.json")) return "package.json";
    if (filename.endsWith("package-lock.json")) return "package-lock.json";
    if (filename.endsWith("yarn.lock")) return "yarn.lock";
    if (filename.endsWith("go.mod")) return "go.mod";
    if (filename.endsWith("Gemfile") || filename.endsWith("Gemfile.lock"))
      return "gemfile";
    if (filename.endsWith("Cargo.toml") || filename.endsWith("Cargo.lock"))
      return "cargo.toml";
    if (filename.endsWith("pom.xml")) return "pom.xml";
    if (filename.endsWith("build.gradle")) return "gradle";
  }

  // Content-based detection
  if (content.includes('"name":') || content.includes('"version":')) {
    return "package.json";
  }
  if (content.includes("# This file is automatically @generated")) {
    return "yarn.lock";
  }
  if (content.includes('"packages":') && content.includes('"dependencies":')) {
    return "package-lock.json";
  }
  if (content.includes("go 1.") || content.includes("module ")) {
    return "go.mod";
  }
  if (content.includes("gem ")) {
    return "gemfile";
  }
  if (content.includes("[dependencies]") || content.includes("[package]")) {
    return "cargo.toml";
  }
  if (content.includes("<?xml") && content.includes("<project>")) {
    return "pom.xml";
  }

  // Default to requirements.txt-like format
  return "requirements.txt";
}

/**
 * Parse dependency content
 */
export function parseDependencies(
  content: string,
  filename?: string,
): ParseResult {
  const format = detectFormat(content, filename);
  let packages: string[] = [];

  switch (format) {
    case "requirements.txt":
      packages = parseRequirementsTxt(content);
      break;
    case "package.json":
      packages = parsePackageJson(content);
      break;
    case "package-lock.json":
      packages = parsePackageLockJson(content);
      break;
    case "yarn.lock":
      packages = parseYarnLock(content);
      break;
    case "go.mod":
      packages = parseGoMod(content);
      break;
    case "gemfile":
      packages = parseGemfile(content);
      break;
    case "cargo.toml":
      packages = parseCargoToml(content);
      break;
    default:
      // Treat as plain text, one package per line
      packages = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"));
  }

  // Remove duplicates and sort
  packages = [...new Set(packages)].sort();

  return { packages, format };
}

/**
 * Parse multiple lines of package names
 */
export function parsePackageList(input: string): string[] {
  const packages: string[] = [];

  const lines = input.split("\n");
  for (const line of lines) {
    const cleaned = line.trim();
    if (cleaned && !cleaned.startsWith("#")) {
      packages.push(cleaned);
    }
  }

  return [...new Set(packages)];
}

/**
 * Detect the ecosystem of a package based on its name
 * Returns "npm", "pypi", or "unknown"
 */
export function detectPackageEcosystem(
  packageName: string,
): "npm" | "pypi" | "unknown" {
  // Normalize the package name
  const normalized = packageName.toLowerCase().trim();

  // Python package name patterns:
  // - Use underscores more than hyphens
  // - Common patterns like django, flask, numpy, etc.
  // - Often use lowercase consistently
  const commonPythonPackages = new Set([
    "numpy",
    "pandas",
    "django",
    "flask",
    "requests",
    "pytest",
    "scipy",
    "matplotlib",
    "scikit-learn",
    "tensorflow",
    "pytorch",
    "sqlalchemy",
    "pillow",
    "beautifulsoup4",
    "scrapy",
    "celery",
    "redis",
    "boto3",
    "google-cloud-storage",
  ]);

  // Check if it's a known Python package
  if (commonPythonPackages.has(normalized)) {
    return "pypi";
  }

  // npm package name patterns:
  // - Scoped packages start with @
  // - Often use hyphens and camelCase
  if (normalized.startsWith("@")) {
    return "npm";
  }

  // Common npm patterns
  const commonNpmPatterns = [
    /^react(-|$)/,
    /^@?vue/,
    /^angular/,
    /^next/,
    /^webpack/,
    /^babel/,
    /^eslint/,
    /^prettier/,
    /^jest/,
    /^typescript/,
  ];

  if (commonNpmPatterns.some((pattern) => pattern.test(normalized))) {
    return "npm";
  }

  // Heuristic: Check for underscores (Python) vs hyphens (npm)
  const hyphenCount = (packageName.match(/-/g) || []).length;
  const underscoreCount = (packageName.match(/_/g) || []).length;

  // If it has underscores and no hyphens, it's probably Python
  if (underscoreCount > 0 && hyphenCount === 0) {
    return "pypi";
  }

  // If it has hyphens and no underscores, it's probably npm
  if (hyphenCount > 0 && underscoreCount === 0) {
    return "npm";
  }

  // Default to npm if unsure
  return "npm";
}

/**
 * Parse dependencies with ecosystem detection
 */
export interface DependencyWithEcosystem {
  name: string;
  ecosystem: "npm" | "pypi" | "unknown";
}

export function parseDependenciesWithEcosystem(
  content: string,
  filename?: string,
): {
  dependencies: DependencyWithEcosystem[];
  format: string;
} {
  const result = parseDependencies(content, filename);

  const dependencies = result.packages.map((pkg) => ({
    name: pkg,
    ecosystem: detectPackageEcosystem(pkg),
  }));

  return { dependencies, format: result.format };
}

/**
 * MSW request handlers for mocking npms.io API
 */

import { http, HttpResponse } from "msw";

const NPMS_API_BASE = "https://api.npms.io/v2";

// Helper to create package details response
function createPackageDetails(
  name: string,
  opts: {
    version?: string;
    description?: string;
    downloads?: number;
    stars?: number;
    forks?: number;
    issues?: number;
    quality?: number;
    popularity?: number;
    maintenance?: number;
    dependencies?: Record<string, string>;
  } = {},
) {
  const {
    version = "1.0.0",
    description = `${name} package`,
    downloads = 1000000,
    stars = 10000,
    forks = 1000,
    issues = 100,
    quality = 0.9,
    popularity = 0.8,
    maintenance = 0.95,
    dependencies = {},
  } = opts;

  return {
    analyzedAt: "2024-01-01T00:00:00.000Z",
    collected: {
      metadata: {
        name,
        version,
        description,
        keywords: [name, "javascript"],
        license: "MIT",
        dependencies,
        devDependencies: {},
        peerDependencies: {},
        links: {
          npm: `https://www.npmjs.com/package/${name}`,
          homepage: `https://${name}.io`,
          repository: `https://github.com/example/${name}`,
          bugs: `https://github.com/example/${name}/issues`,
        },
        author: {
          name: "Mock Author",
          email: "mock@example.com",
        },
        maintainers: [
          { username: "maintainer1", email: "m1@example.com" },
          { username: "maintainer2", email: "m2@example.com" },
        ],
      },
      npm: {
        // Index 0 = daily, Index 1 = weekly (what we use)
        downloads: [
          {
            from: "2024-01-06",
            to: "2024-01-07",
            count: Math.floor(downloads / 7),
          },
          { from: "2024-01-01", to: "2024-01-07", count: downloads },
        ],
        dependentsCount: Math.floor(downloads / 10000),
        starsCount: 0,
      },
      github: {
        starsCount: stars,
        forksCount: forks,
        subscribersCount: Math.floor(stars / 10),
        issues: {
          count: issues + 50,
          openCount: issues,
          distribution: {},
          isDisabled: false,
        },
        commits: [{ from: "2024-01-01", to: "2024-01-07", count: 10 }],
      },
    },
    evaluation: {
      quality: {
        carefulness: quality * 0.9,
        tests: quality * 0.8,
        health: quality * 0.95,
        branding: quality * 0.7,
      },
      popularity: {
        communityInterest: popularity * 0.9,
        downloadsCount: popularity * 0.95,
        downloadsAcceleration: popularity * 0.5,
        dependentsCount: popularity * 0.8,
      },
      maintenance: {
        releasesFrequency: maintenance * 0.85,
        commitsFrequency: maintenance * 0.9,
        openIssues: maintenance * 0.8,
        issuesDistribution: maintenance * 0.75,
      },
    },
    score: {
      final: (quality + popularity + maintenance) / 3,
      detail: {
        quality,
        popularity,
        maintenance,
      },
    },
  };
}

// Mock package database
const mockPackages: Record<
  string,
  ReturnType<typeof createPackageDetails> | undefined
> = {
  react: createPackageDetails("react", {
    version: "18.2.0",
    description: "A JavaScript library for building user interfaces",
    downloads: 20000000,
    stars: 220000,
    forks: 45000,
    issues: 800,
    quality: 0.95,
    popularity: 0.99,
    maintenance: 0.98,
  }),
  vue: createPackageDetails("vue", {
    version: "3.4.0",
    description: "The progressive JavaScript framework",
    downloads: 5000000,
    stars: 45000,
    forks: 8000,
    issues: 300,
    quality: 0.94,
    popularity: 0.95,
    maintenance: 0.97,
  }),
  preact: createPackageDetails("preact", {
    version: "10.19.0",
    description: "Fast 3kB alternative to React with the same modern API",
    downloads: 2000000,
    stars: 36000,
    forks: 2000,
    issues: 150,
    quality: 0.92,
    popularity: 0.85,
    maintenance: 0.95,
  }),
  lodash: createPackageDetails("lodash", {
    version: "4.17.21",
    description: "Lodash modular utilities",
    downloads: 50000000,
    stars: 59000,
    forks: 7000,
    issues: 400,
    quality: 0.97,
    popularity: 0.99,
    maintenance: 0.9,
  }),
  express: createPackageDetails("express", {
    version: "4.18.2",
    description: "Fast, unopinionated, minimalist web framework for Node.js",
    downloads: 30000000,
    stars: 63000,
    forks: 13000,
    issues: 180,
    quality: 0.95,
    popularity: 0.98,
    maintenance: 0.85,
    dependencies: { "body-parser": "1.20.1", cookie: "0.5.0" },
  }),
  fastify: createPackageDetails("fastify", {
    version: "4.24.0",
    description: "Fast and low overhead web framework, for Node.js",
    downloads: 2000000,
    stars: 30000,
    forks: 2200,
    issues: 80,
    quality: 0.96,
    popularity: 0.88,
    maintenance: 0.98,
  }),
  koa: createPackageDetails("koa", {
    version: "2.14.2",
    description: "Expressive HTTP middleware framework for node.js",
    downloads: 1500000,
    stars: 35000,
    forks: 3300,
    issues: 50,
    quality: 0.93,
    popularity: 0.82,
    maintenance: 0.88,
  }),
  moment: createPackageDetails("moment", {
    version: "2.29.4",
    description: "Parse, validate, manipulate, and display dates",
    downloads: 18000000,
    stars: 48000,
    forks: 7200,
    issues: 250,
    quality: 0.91,
    popularity: 0.97,
    maintenance: 0.7,
  }),
  dayjs: createPackageDetails("dayjs", {
    version: "1.11.10",
    description: "2KB immutable date library alternative to Moment.js",
    downloads: 15000000,
    stars: 46000,
    forks: 2300,
    issues: 700,
    quality: 0.94,
    popularity: 0.96,
    maintenance: 0.92,
  }),
  "date-fns": createPackageDetails("date-fns", {
    version: "2.30.0",
    description: "Modern JavaScript date utility library",
    downloads: 12000000,
    stars: 34000,
    forks: 1700,
    issues: 350,
    quality: 0.95,
    popularity: 0.93,
    maintenance: 0.94,
  }),
  underscore: createPackageDetails("underscore", {
    version: "1.13.6",
    description: "JavaScript's functional programming helper library",
    downloads: 8000000,
    stars: 27000,
    forks: 5500,
    issues: 60,
    quality: 0.9,
    popularity: 0.88,
    maintenance: 0.75,
  }),
  ramda: createPackageDetails("ramda", {
    version: "0.29.1",
    description: "Practical functional Javascript",
    downloads: 5000000,
    stars: 24000,
    forks: 1500,
    issues: 200,
    quality: 0.93,
    popularity: 0.85,
    maintenance: 0.88,
  }),
  axios: createPackageDetails("axios", {
    version: "1.6.2",
    description: "Promise based HTTP client for the browser and node.js",
    downloads: 45000000,
    stars: 104000,
    forks: 10800,
    issues: 500,
    quality: 0.93,
    popularity: 0.99,
    maintenance: 0.9,
  }),
};

// Search results helper
function createSearchResult(
  name: string,
  description: string,
  version: string,
) {
  return {
    package: { name, description, version },
  };
}

// Mock search results database
const mockSearchResults: Record<
  string,
  Array<ReturnType<typeof createSearchResult>>
> = {
  react: [
    createSearchResult(
      "react",
      "A JavaScript library for building user interfaces",
      "18.2.0",
    ),
    createSearchResult("react-dom", "React DOM rendering", "18.2.0"),
    createSearchResult(
      "react-router",
      "Declarative routing for React",
      "6.20.0",
    ),
  ],
  vue: [
    createSearchResult("vue", "The progressive JavaScript framework", "3.4.0"),
    createSearchResult("vue-router", "Official router for Vue.js", "4.2.0"),
  ],
  preact: [
    createSearchResult("preact", "Fast 3kB alternative to React", "10.19.0"),
  ],
  lodash: [
    createSearchResult("lodash", "Lodash modular utilities", "4.17.21"),
    createSearchResult("lodash-es", "Lodash exported as ES modules", "4.17.21"),
  ],
  express: [
    createSearchResult(
      "express",
      "Fast, unopinionated, minimalist web framework",
      "4.18.2",
    ),
  ],
  fastify: [
    createSearchResult(
      "fastify",
      "Fast and low overhead web framework",
      "4.24.0",
    ),
  ],
  koa: [
    createSearchResult("koa", "Expressive HTTP middleware framework", "2.14.2"),
  ],
  moment: [
    createSearchResult(
      "moment",
      "Parse, validate, manipulate, and display dates",
      "2.29.4",
    ),
  ],
  dayjs: [
    createSearchResult(
      "dayjs",
      "2KB immutable date library alternative to Moment.js",
      "1.11.10",
    ),
  ],
  "date-fns": [
    createSearchResult(
      "date-fns",
      "Modern JavaScript date utility library",
      "2.30.0",
    ),
  ],
  underscore: [
    createSearchResult(
      "underscore",
      "JavaScript's functional programming helper library",
      "1.13.6",
    ),
  ],
  ramda: [
    createSearchResult("ramda", "Practical functional Javascript", "0.29.1"),
  ],
  axios: [
    createSearchResult(
      "axios",
      "Promise based HTTP client for the browser and node.js",
      "1.6.2",
    ),
  ],
};

/**
 * MSW handlers for npms.io API and GitHub API
 */
export const handlers = [
  // Search suggestions endpoint
  http.get(`${NPMS_API_BASE}/search/suggestions`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.toLowerCase() || "";

    // Find matching packages
    const packageNames = Object.keys(mockSearchResults);
    const matchingPackage = packageNames.find(
      (name) =>
        name.toLowerCase().startsWith(query) ||
        query.startsWith(name.toLowerCase()),
    );

    if (matchingPackage) {
      return HttpResponse.json(mockSearchResults[matchingPackage]);
    }

    // Return empty results for unknown packages
    return HttpResponse.json([]);
  }),

  // Package details endpoint
  http.get(`${NPMS_API_BASE}/package/:packageName`, ({ params }) => {
    const packageName = decodeURIComponent(params.packageName as string);
    const packageData = mockPackages[packageName];

    if (packageData) {
      return HttpResponse.json(packageData);
    }

    // Return 404 for unknown packages
    return new HttpResponse(JSON.stringify({ error: "Package not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }),

  // GitHub API - repo details (used by NpmAdapter for additional data)
  http.get("https://api.github.com/repos/:owner/:repo", ({ params }) => {
    const owner = String(params.owner);
    const repo = String(params.repo);
    return HttpResponse.json({
      id: 12345,
      name: repo,
      full_name: `${owner}/${repo}`,
      description: `Mock description for ${repo}`,
      homepage: `https://${repo}.io`,
      language: "JavaScript",
      stargazers_count: 50000,
      watchers_count: 50000,
      forks_count: 5000,
      open_issues_count: 100,
      subscribers_count: 1000,
      created_at: "2020-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      pushed_at: "2024-01-01T00:00:00Z",
      default_branch: "main",
      size: 15000,
    });
  }),

  // GitHub API - README endpoint
  http.get("https://api.github.com/repos/:owner/:repo/readme", ({ params }) => {
    const repo = String(params.repo);
    // Return a simple base64 encoded README
    const readmeContent = `# ${repo}\n\nThis is a mock README for testing.`;
    const base64Content = btoa(readmeContent);
    return HttpResponse.json({
      content: base64Content,
      encoding: "base64",
    });
  }),
];

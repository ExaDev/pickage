/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Dynamic base path for GitHub Pages deployment
// In CI, extracts repository name from GITHUB_REPOSITORY (format: owner/repo-name)
// Falls back to "/" for local development
const getBasePath = () => {
  if (process.env.NODE_ENV !== "production") {
    return "/";
  }

  // In GitHub Actions, extract repo name from GITHUB_REPOSITORY
  if (process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split("/")[1];
    return `/${repoName}/`;
  }

  // Fallback for local production builds
  return "/package-compare/";
};

export default defineConfig({
  plugins: [react()],
  base: getBasePath(),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "esnext",
    minify: "esbuild",
  },
  // vitest config
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.tsx",
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData",
      ],
    },
  },
});

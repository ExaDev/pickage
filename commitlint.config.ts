export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation changes
        "style", // Code style changes (formatting, etc)
        "refactor", // Code refactoring
        "test", // Adding or updating tests
        "chore", // Maintenance tasks
        "perf", // Performance improvements
        "ci", // CI/CD changes
        "build", // Build system changes
        "revert", // Revert a commit
      ],
    ],
    "scope-enum": [
      2,
      "always",
      [
        "app", // Application-level changes
        "ui", // UI components
        "api", // API/adapters
        "hooks", // Custom hooks
        "utils", // Utility functions
        "types", // TypeScript types
        "test", // Tests
        "config", // Configuration
        "deps", // Dependencies
      ],
    ],
    "subject-case": [0], // Allow any case (we'll enforce manually)
    "body-max-line-length": [0], // Allow long lines for detailed explanations
  },
};

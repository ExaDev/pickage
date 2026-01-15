export default {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,yml,yaml}': ['prettier --write'],
  // Exclude CHANGELOG.md as it's managed by semantic-release
  '*.md': (filenames) =>
    filenames
      .filter((filename) => filename !== 'CHANGELOG.md')
      .map((filename) => `prettier --write "${filename}"`),
};

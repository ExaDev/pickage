# [1.2.0](https://github.com/ExaDev/package-compare/compare/v1.1.0...v1.2.0) (2026-01-15)

### Features

- **config:** make vite base path dynamic using GITHUB_REPOSITORY ([4a32511](https://github.com/ExaDev/package-compare/commit/4a325113ce46822e52b0a8b48ea9bcbfadade95f))

# [1.1.0](https://github.com/ExaDev/package-compare/compare/v1.0.1...v1.1.0) (2026-01-15)

### Features

- **release:** add GitHub releases with semantic-release ([46c7c93](https://github.com/ExaDev/package-compare/commit/46c7c9399cd1ef9748e1797fde40643aae728bdd))

## [1.0.1](https://github.com/ExaDev/package-compare/compare/v1.0.0...v1.0.1) (2026-01-15)

### Bug Fixes

- **release:** remove pre-commit hook skip for release commits ([d82d420](https://github.com/ExaDev/package-compare/commit/d82d42098e5e16295015c6dc6a6ae345ea99133e))

# 1.0.0 (2026-01-15)

### Bug Fixes

- **adapter:** properly parse nested npms.io API response ([f998a5f](https://github.com/ExaDev/package-compare/commit/f998a5f7b03106e630069fe13c6d65915f469f59))
- **config:** update production base path to /package-compare/ ([1aa0c6b](https://github.com/ExaDev/package-compare/commit/1aa0c6b3909b979641b7cb39b33daa4aa7fba044))
- **hooks:** skip pre-commit hooks for semantic-release commits ([102ea51](https://github.com/ExaDev/package-compare/commit/102ea51d2923e4cc7f13c566046c54c7742947a0))
- **release:** fix semantic-release CI workflow ([db186a4](https://github.com/ExaDev/package-compare/commit/db186a4451e443c13cfd09dc33196732591086d5))
- remove pnpm version from workflow to use packageManager field ([754b46d](https://github.com/ExaDev/package-compare/commit/754b46d79eafed65e2de54ebc2d32cb6fa53e6cc))
- **ui:** replace emoji with Mantine icon in EmptyState ([7a5a0fb](https://github.com/ExaDev/package-compare/commit/7a5a0fb797bc3dd0b7e2ecdc80b269058ce9e638))
- update husky hooks to v9+ format ([3e7fecc](https://github.com/ExaDev/package-compare/commit/3e7fecce6b03de697bb29af17f893805c8169aaf))

### Features

- add autocomplete to package name inputs ([ade1615](https://github.com/ExaDev/package-compare/commit/ade161552a472f587f67687449e364d136c7cd0e))
- add comparison UI components ([dfb2740](https://github.com/ExaDev/package-compare/commit/dfb2740285fbb5833ecf3d037359b54b4b7913ee))
- add package comparison hooks ([bd00722](https://github.com/ExaDev/package-compare/commit/bd00722be5e3241331c90ec9f79a75c918441f61))
- add UI components ([7693af8](https://github.com/ExaDev/package-compare/commit/7693af829958af5d2773e725e9f2cd981485f84a))
- **app:** add BrowserRouter for URL-based state management ([26fa6d7](https://github.com/ExaDev/package-compare/commit/26fa6d76617c347dcc855d4ac4a8c83ea981f5e8))
- **app:** add skip link and keyboard navigation ([1dc7157](https://github.com/ExaDev/package-compare/commit/1dc7157c12543f406fce73d6066368279aaf8c47))
- **app:** integrate MantineProvider and new UI components ([74b067f](https://github.com/ExaDev/package-compare/commit/74b067f4ccccf6a666988fdea803ee40d62270cd))
- **app:** integrate new dashboard layout ([28e9b16](https://github.com/ExaDev/package-compare/commit/28e9b16d6a79217d3fc41cfd88398f186aaab3d6))
- **app:** integrate Phase 3 UX features ([c6d4757](https://github.com/ExaDev/package-compare/commit/c6d47576a5122303115c3815deb62b313cf5ecb1))
- assemble main application ([4e031b4](https://github.com/ExaDev/package-compare/commit/4e031b4ba3f03c55eb0d775f83bbff55d0c950ff))
- **comparator:** implement compareMany for N packages ([8f2d203](https://github.com/ExaDev/package-compare/commit/8f2d2037a614a799e030bf162d652174abd474c9))
- define core type system ([8aaaebe](https://github.com/ExaDev/package-compare/commit/8aaaebe8648d466a11889f134270e5df9dee16cd))
- **hook:** refactor usePackageComparison for array input ([079b5bc](https://github.com/ExaDev/package-compare/commit/079b5bc8573798bb362d5d801d88ca9f204d9f4c))
- **hooks:** add keyboard navigation hook ([2aa0bf6](https://github.com/ExaDev/package-compare/commit/2aa0bf6d9f6bca0c7aeb3540524dd52c8dd7a385))
- **hooks:** add useComparisonHistory hook for localStorage ([a335426](https://github.com/ExaDev/package-compare/commit/a335426bc9d4ee13d2a6e32445b0e00352cf143c))
- **hooks:** add useShareableUrl hook for URL state management ([228cca2](https://github.com/ExaDev/package-compare/commit/228cca273185289fc44db76c2221cca4bed27c07))
- implement caching layer ([b7e37af](https://github.com/ExaDev/package-compare/commit/b7e37af6e93584fc1605553f1d1e7c1ad9dc3159))
- implement comparison service ([2bbdbdc](https://github.com/ExaDev/package-compare/commit/2bbdbdc4e8ab6d939b908ba5f9d9bf96d2055c2d))
- implement GitHub API client ([a44d1f3](https://github.com/ExaDev/package-compare/commit/a44d1f33b6ada9e177afc5a47722070da9b2892a))
- implement npm ecosystem adapter ([0b6ed53](https://github.com/ExaDev/package-compare/commit/0b6ed53e66ec349bf9027308397c2ec2e320e5a8))
- implement npms.io API client ([d747b54](https://github.com/ExaDev/package-compare/commit/d747b543000de9006212674e9fbfb66a2018a749))
- **input:** add dynamic add/remove package functionality ([59a24d0](https://github.com/ExaDev/package-compare/commit/59a24d0be74d87f34cdcf4d229b561216bb74de4))
- **table:** refactor ComparisonTable for dynamic columns ([a921378](https://github.com/ExaDev/package-compare/commit/a921378a2b6e4d6839a4640adc7bde821a673586))
- **theme:** add custom brand colors to Mantine theme ([c13c9f7](https://github.com/ExaDev/package-compare/commit/c13c9f7cbea537eb323a7fc72dec73c559218c3d))
- **types:** add N-package comparison interfaces ([510c16d](https://github.com/ExaDev/package-compare/commit/510c16d8cd02dc02cf3fd5c911e7ac79dd433f64))
- **ui:** add ARIA labels and update table components ([a90247a](https://github.com/ExaDev/package-compare/commit/a90247a8ca03c8d621598393d1fc1f7fef9d93dc))
- **ui:** add empty state component for onboarding ([cbc6f27](https://github.com/ExaDev/package-compare/commit/cbc6f27db9cb0599e37ba5cbbee8965aee9dd23b))
- **ui:** add history panel component ([387400c](https://github.com/ExaDev/package-compare/commit/387400cf64950ef1dd62737a245b987f4afedc16))
- **ui:** add metric card component ([c5e4907](https://github.com/ExaDev/package-compare/commit/c5e4907778fd6267957b78669dbf8795d7af68bc))
- **ui:** add package cards component ([cd3561a](https://github.com/ExaDev/package-compare/commit/cd3561aa074661b5ce21cbaf421ef54022977f71))
- **ui:** add ReadmeAccordion component ([36b9dfb](https://github.com/ExaDev/package-compare/commit/36b9dfb826722e28b83f31c1dbc042b055cddf96))
- **ui:** add ref forwarding and touch targets to PackageInput ([2016474](https://github.com/ExaDev/package-compare/commit/201647474518d4a912621001d76773f13da490a2))
- **ui:** add responsive table component for mobile ([730a925](https://github.com/ExaDev/package-compare/commit/730a9255e5306136b99e03ab9445aa9794ca2f38))
- **ui:** add results dashboard component ([ff8c9c4](https://github.com/ExaDev/package-compare/commit/ff8c9c442e77f590135433c3b7676c5e22ab181b))
- **ui:** add results skeleton component ([669ee75](https://github.com/ExaDev/package-compare/commit/669ee75e71429ccc5c27147c2c8f79665d4d1c4c))
- **ui:** add share button component ([2364a19](https://github.com/ExaDev/package-compare/commit/2364a19e376ff71a9b69f6f92e417ce113d0b03f))
- **ui:** add sticky input bar component ([bce5b87](https://github.com/ExaDev/package-compare/commit/bce5b878341e335b32c259808b084894db328d8d))
- **ui:** add SVG-based sparkline component ([9c15bde](https://github.com/ExaDev/package-compare/commit/9c15bde4b6341bbabc166e75ea84c06bfc112da1))
- **ui:** add transitions and hover effects ([3c29964](https://github.com/ExaDev/package-compare/commit/3c29964894d7a71b1485fa37c5bb071599ea671e))
- **utils:** add CSV export utility ([e400d40](https://github.com/ExaDev/package-compare/commit/e400d4084c751f6fd4ca5881ea984d32d8981f2a))

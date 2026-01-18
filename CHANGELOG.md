## [1.6.2](https://github.com/ExaDev/peek-package/compare/v1.6.1...v1.6.2) (2026-01-18)

## [1.6.1](https://github.com/ExaDev/peek-package/compare/v1.6.0...v1.6.1) (2026-01-18)

# [1.6.0](https://github.com/ExaDev/peek-package/compare/v1.5.0...v1.6.0) (2026-01-16)

### Features

- **ui:** display app version in top bar ([33353a3](https://github.com/ExaDev/peek-package/commit/33353a3680e2cc7484302ea48e1b6e9472ce363d))

# [1.5.0](https://github.com/ExaDev/peek-package/compare/v1.4.0...v1.5.0) (2026-01-16)

### Bug Fixes

- **ui:** improve mobile responsive layout ([177278b](https://github.com/ExaDev/peek-package/commit/177278b6bd1c9f0d8e63fadeefc8acb4640700fd))
- **ui:** prevent sticky bar height change on search expand ([2ad9a62](https://github.com/ExaDev/peek-package/commit/2ad9a62e23eada160cebd5376541248f8b382e43))

### Features

- **ui:** add collapsible search bar for mobile ([b00b2e0](https://github.com/ExaDev/peek-package/commit/b00b2e0d772206c60521fcf6ef579d77cb716a95))
- **ui:** collapse search on blur when empty or whitespace ([6f277b7](https://github.com/ExaDev/peek-package/commit/6f277b709c538af79add46a10795eab30bafc528))

# [1.4.0](https://github.com/ExaDev/peek-package/compare/v1.3.0...v1.4.0) (2026-01-15)

### Bug Fixes

- **api:** correct weekly downloads index and GitHub URL parsing ([5ccaf36](https://github.com/ExaDev/peek-package/commit/5ccaf36a21da2866daa199a1824b6996461828d0))
- **api:** display popularity metrics as raw values not percentages ([3a59816](https://github.com/ExaDev/peek-package/commit/3a59816ac0b082b4fd9743a0e9a52bf791d4438c))
- **api:** handle maintainers with username instead of name ([c9624a5](https://github.com/ExaDev/peek-package/commit/c9624a51403cb8dce79bb29fcb1fca34ba8526da))
- prevent duplicate package keys and deduplicate URL params ([30bcab5](https://github.com/ExaDev/peek-package/commit/30bcab5215b2b1955053aeef67d35ad997fbf661))
- **test:** target h4 headings for package titles to avoid README conflicts ([3283845](https://github.com/ExaDev/peek-package/commit/3283845c16659b97762fe5f7fbd343d82c6d70c7))
- **ui:** allow README sections to have independent heights ([c487362](https://github.com/ExaDev/peek-package/commit/c4873625bdf58b8c38f22c61264a95cdbcbced5c))
- **ui:** center columns and fix scroll for many packages ([949fda7](https://github.com/ExaDev/peek-package/commit/949fda73acd883dd09369adfc94b30211a568023))
- **ui:** constrain README images and enable badge row wrapping ([d5ce5fd](https://github.com/ExaDev/peek-package/commit/d5ce5fd9e6d642e4be34549a1a488f2b714510b0))
- **ui:** improve maintainers overflow detection timing ([7845e7b](https://github.com/ExaDev/peek-package/commit/7845e7b4caa7d05bb1bde7774fd842af4ef165a8))
- **ui:** only show expand button when maintainers overflow ([d8db04b](https://github.com/ExaDev/peek-package/commit/d8db04b9cb9be4b4bceb3d1c2e21590526fec610))
- **ui:** preserve expand button after collapse ([0a8ae03](https://github.com/ExaDev/peek-package/commit/0a8ae036b225d0737881b52b85039f2f8bb2753e))
- **ui:** use theme-aware colors for dark mode support ([3821e4f](https://github.com/ExaDev/peek-package/commit/3821e4f6e344ef8d0efa06aa8a5f68e55c5f5e55))
- **ui:** widen columns to make better use of screen space ([8292c1a](https://github.com/ExaDev/peek-package/commit/8292c1af4ee1de878c0e2565bc0f559a79186f02))

### Features

- add error boundary to catch React rendering errors ([006b6e2](https://github.com/ExaDev/peek-package/commit/006b6e278c3581237c3b0b5b7ae94dd6bbbd211f))
- add persistent cache and graceful GitHub rate limit handling ([dbd20d3](https://github.com/ExaDev/peek-package/commit/dbd20d3918d577a1ca509f4810da16e3589a970c))
- **api:** extract all available fields from npms.io API ([0718341](https://github.com/ExaDev/peek-package/commit/07183411ff26e38ff47146fad7ddd47b818b03fc))
- **app:** wire sorting state management ([f71bebb](https://github.com/ExaDev/peek-package/commit/f71bebb4dd10c13ab768206f2444c07530d8c7ef))
- auto-remove non-existent packages from URL ([80fb32e](https://github.com/ExaDev/peek-package/commit/80fb32e2241db9c526c913f145ad3f9cd8a34c3a))
- extend cache to 72 hours and add manual refresh button ([41e76a4](https://github.com/ExaDev/peek-package/commit/41e76a4a64bc9c82228bae8fd8ed7dec9052f298))
- **hooks:** add package sorting hook ([1360127](https://github.com/ExaDev/peek-package/commit/13601272b68406b29765292b948a3cf8141c36ab))
- **hooks:** add separate npm and GitHub queries with independent caching ([80990b1](https://github.com/ExaDev/peek-package/commit/80990b17c5b684fbc99aa04f9c022bfbc6c35038))
- **hooks:** add sort criteria URL sync ([17e45a9](https://github.com/ExaDev/peek-package/commit/17e45a9dd472b45770ccc1024bd4d2dd396d4d04))
- **hooks:** enable browser history for package changes ([2c99a7a](https://github.com/ExaDev/peek-package/commit/2c99a7ad406de11593e67619239d7557118054d5))
- **hooks:** pass all new metrics through usePackageComparison ([63af005](https://github.com/ExaDev/peek-package/commit/63af0054bc501d058fc4aa4116d408c4afdc616f))
- **types:** add fields for all available npm and GitHub metrics ([491338c](https://github.com/ExaDev/peek-package/commit/491338cbb8e8431039fce3edd260d630ff45d9d2))
- **types:** add sort types and default directions ([f65d4f4](https://github.com/ExaDev/peek-package/commit/f65d4f4dbb468b11ae21f261ea1e9f7ecad3fc06))
- **ui:** add expandable maintainers section ([33cecb2](https://github.com/ExaDev/peek-package/commit/33cecb26e85a3f3eed9237d5e0f29e9b25d2a92c))
- **ui:** add GitHub contributors with profile pictures ([eeb3bb2](https://github.com/ExaDev/peek-package/commit/eeb3bb2b909a4d68d889b76260e54ae3f254ce09))
- **ui:** add Gravatar avatars for package maintainers ([7979511](https://github.com/ExaDev/peek-package/commit/7979511258651f2f9e808e964a26edb2490f08ea))
- **ui:** add grouped npm/GitHub display with separate refresh buttons ([fb5cc75](https://github.com/ExaDev/peek-package/commit/fb5cc7524a791e8fbff9a6a44aaa438f5f384e28))
- **ui:** add multi-view layout with carousel, grid, list, and table modes ([160022d](https://github.com/ExaDev/peek-package/commit/160022ddee97eec561dfe70c70ca7277514daf7f))
- **ui:** add smooth animation to maintainers expand/collapse ([b54db7c](https://github.com/ExaDev/peek-package/commit/b54db7c1449312c55ce1b5c48c100600ffeee9b8))
- **ui:** add sort sidebar component ([2c9503d](https://github.com/ExaDev/peek-package/commit/2c9503d9e447d7d6a22f75e05721162225bc6442))
- **ui:** align individual fields across columns using nested subgrid ([560dd85](https://github.com/ExaDev/peek-package/commit/560dd858c8d5bf9c45f61f35d141236c69b6539e))
- **ui:** align sections across columns using CSS subgrid ([fc42daa](https://github.com/ExaDev/peek-package/commit/fc42daaf326bf35abc24fc188b4bcba225d1bc5c))
- **ui:** display all metrics with accordion sections ([f91d36b](https://github.com/ExaDev/peek-package/commit/f91d36b1fd04991fb152e7c800795ebf3fa060e4))
- **ui:** full viewport layout with flexible columns ([e44d9a2](https://github.com/ExaDev/peek-package/commit/e44d9a26738548b245879cf651e6b248d1501eb8))
- **ui:** integrate sort sidebar into carousel view ([47cb087](https://github.com/ExaDev/peek-package/commit/47cb087e682dab012ba2716741a8b2e9f6b91df9))
- **ui:** single input bar layout with centralized package search ([1dcde25](https://github.com/ExaDev/peek-package/commit/1dcde2586bcbbef968b40cf6d1e8195144e162ef))

# [1.3.0](https://github.com/ExaDev/peek-package/compare/v1.2.1...v1.3.0) (2026-01-15)

### Bug Fixes

- **api:** add type guard for Octokit errors and fix regex escapes ([6e41a6e](https://github.com/ExaDev/peek-package/commit/6e41a6e5950d1a18c930fda6f1a68965474673b5))
- **api:** handle missing dependencies in npm adapter ([8cca6bb](https://github.com/ExaDev/peek-package/commit/8cca6bb3bb99e3cba88f9088cb4d72a9186c49e6))
- **api:** return null instead of throwing on GitHub API failures ([2b2bd15](https://github.com/ExaDev/peek-package/commit/2b2bd15a1404cead0a644250ac96c16c42c55556))
- **hooks:** limit retries in usePackageComparison ([c12d7c1](https://github.com/ExaDev/peek-package/commit/c12d7c15fb37204ea46f58a167a544bf99575cdc))
- **hooks:** use correct null check in error filter ([3049fee](https://github.com/ExaDev/peek-package/commit/3049fee362f07066ed0f2ff40e86597ac82c205c))
- prettify URL by avoiding encoding of colons and commas ([4c5a3c7](https://github.com/ExaDev/peek-package/commit/4c5a3c74c24fdc2520c65d2a413a10d62b958216))
- **test:** match exact react option in API integration test ([e00f998](https://github.com/ExaDev/peek-package/commit/e00f998b2544177bda87fec258498f99166d9f39))
- **types:** correct NpmsPackageResponse to match actual API structure ([229f9be](https://github.com/ExaDev/peek-package/commit/229f9be4691fe6fe9597f9db365b33cc4bfdb948))
- **ui:** fix column layout - remove nested Flex structure ([689e374](https://github.com/ExaDev/peek-package/commit/689e37451195aa13800899bf3e9eac52770dc0fc))
- **ui:** separate add button from columns to prevent alignment issues ([e9b19a4](https://github.com/ExaDev/peek-package/commit/e9b19a41cfb69a6f89b377a2710683f46b3cadc0))
- **ui:** use absolute positioning for add button to not affect column centering ([cbfd11a](https://github.com/ExaDev/peek-package/commit/cbfd11ab9a406c2de176719cc3e5401a14120859))
- **ui:** use fixed column width for side-by-side layout ([c7f39da](https://github.com/ExaDev/peek-package/commit/c7f39dab8971f43eadfebce97d0677ce442f7443))
- **ui:** use horizontal scroll instead of wrap for desktop columns ([b97706b](https://github.com/ExaDev/peek-package/commit/b97706bad8a9d9727edbc303e6821424b630b1d8))
- **ui:** use sticky positioning for header to prevent overlap ([076eede](https://github.com/ExaDev/peek-package/commit/076eede11710abe107da515cec827d23d65be6b3))
- **utils:** use unknown instead of any for cached data type ([86b9e27](https://github.com/ExaDev/peek-package/commit/86b9e272ee69c48b22a57520365c0bf3ee7b0803))

### Features

- add URL state sync for shareable package comparisons ([9f971b1](https://github.com/ExaDev/peek-package/commit/9f971b13cc30cf312a0a7e96071ac88577e4a4d5))
- **hooks:** add usePackageColumn hook for column state management ([87de74a](https://github.com/ExaDev/peek-package/commit/87de74a0325e6f81c878fa5f13d7554b60c148e1))
- **test:** add MSW for API mocking in e2e tests ([e3c84fa](https://github.com/ExaDev/peek-package/commit/e3c84faf49e3cf0cab373e5bb3de91e25f238a54))
- **test:** add Playwright e2e test infrastructure ([e68b557](https://github.com/ExaDev/peek-package/commit/e68b557b5d37ee96af163be0b6d81e3ee808433b))
- **ui:** add AddColumnButton FAB with remaining slots ([86b8d9a](https://github.com/ExaDev/peek-package/commit/86b8d9a583b4acf14028a92d08e706da92d1f223))
- **ui:** add PackageColumn component combining input + metrics ([96f33a9](https://github.com/ExaDev/peek-package/commit/96f33a9ac778fb0105c747a86474d9f13ecd7d88))
- **ui:** add PackageComparisonLayout with responsive flex layout ([a5e454f](https://github.com/ExaDev/peek-package/commit/a5e454fa6de063e90fdd51bab764d07465d7d6a5))
- **ui:** add PackageMetricsPanel component for vertical metric display ([f504cef](https://github.com/ExaDev/peek-package/commit/f504cef6e9ab97edeadaeed1c4dfefb47b420c03))
- **ui:** defer API calls until explicit submission ([cef0e01](https://github.com/ExaDev/peek-package/commit/cef0e01ce2ad463a219f36ebea37c5e19d660053))
- **ui:** extract PackageAutocompleteInput component ([680d7e0](https://github.com/ExaDev/peek-package/commit/680d7e0499a9f0f9dd76950bfcf17e19eae0e0c2))
- **ui:** move README display into each package column ([0054f13](https://github.com/ExaDev/peek-package/commit/0054f13634d369c34959d72516d5d56ba33450b5))
- **ui:** restore README accordion in comparison layout ([899404a](https://github.com/ExaDev/peek-package/commit/899404a323342b24a383a9d355c80871f7ecf05a))

## [1.2.1](https://github.com/ExaDev/package-compare/compare/v1.2.0...v1.2.1) (2026-01-15)

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

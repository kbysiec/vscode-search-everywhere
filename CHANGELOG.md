# Change Log

All notable changes to the "vscode-search-everywhere" extension will be documented in this file.

## [3.2.0] - 2026-10-05
### 🔍 In-File Scope Search, Split Editor & Remote Development Fixes
- **In-File Scope Search & Outline Navigation** (issue #45):
  - Added `searchEverywhere.searchCurrentFile` (`cmd+alt+o` on macOS / `ctrl+alt+o` on Windows/Linux) to immediately search symbols within the currently active editor file.
  - Drill-down navigation: seamlessly navigate from workspace search results into any file's symbol list via right-arrow icon button or `alt+right` (`searchEverywhere.navigateIntoFile`).
  - Navigate back anytime using the title bar Back button or `alt+left` (`searchEverywhere.navigateBack`), automatically restoring your previous workspace search query and position.
- **Open to the Side Command & Shortcut**:
  - Added `searchEverywhere.openToTheSide` to open highlighted symbols and files directly in a side-by-side split editor (`vscode.ViewColumn.Beside`).
  - Configurable default shortcuts: `cmd+enter` / `alt+enter` (macOS) and `ctrl+enter` / `alt+enter` (Windows/Linux), as well as a dedicated split preview icon button on each result item.
- **Remote Host Duplicate Tab Fix** (issue #46):
  - Fixed an issue where opening cached items in remote hosts (SSH, WSL, Dev Containers, Codespaces) resulted in new duplicate editor tabs being opened every time.
  - Replaced path string conversions with robust URI parsing (`ensureUri`), preserving remote schemes (`vscode-remote://`, `vscode-vfs://`, etc.) and authority across serialization and cache lookups.
  - Expanded `patternProvider` to properly support include/exclude pattern matching on remote and virtual filesystems.
- **Performance & Instant UI Rendering**:
  - Eliminated UI lag when drilling down into file scope by rendering cached SQLite symbols immediately (< 5 ms) and fetching updated Language Server symbols non-blockingly in the background.
  - Added dedicated SQLite B-tree indexes (`idx_symbols_uri_nocase`, `idx_symbols_uri_line_nocase`) ensuring instant O(log N) file-scoped symbol lookups without full table scans.

## [3.1.0] - 2026-10-05
### ⚡ Shared Worktree Cache, Recent Items & Enhanced Matching
- **Shared Repository Cache for Git Worktrees & Clones** (issue #54):
  - Automatically shares the SQLite database cache across git worktrees and local clones of the same repository (keyed by git remote URL or repository root).
  - Opening a new git worktree instantly uses the existing indexed database — zero cold-start indexing overhead.
  - Added setting `searchEverywhere.shareCacheAcrossWorktrees` (default `true`).
  - Added command `searchEverywhere.clearSharedCache` to explicitly clear shared worktree caches when needed.
- **Recent Items & Open Editors on Empty Search**:
  - Opening search with an empty query now displays recently opened symbols/files and currently active editor tabs first.
  - Deduped navigation with custom separators (`Recent Items`, `Open Editors`) for instant context switching, matching JetBrains / native Quick Open behavior.
  - Added settings `searchEverywhere.showRecentItemsOnEmpty` (default `true`) and `searchEverywhere.recentItemsLimit` (default `10`).
- **Clean Name Indexing & Fuzzy Symbol Matching** (issue #49):
  - Stripped prefixes/icons from database query comparisons (`cleanName`) and created dedicated case-insensitive SQLite B-Tree indexes.
  - Enhanced search accuracy and speed for fuzzy prefix matching and camelCase/snake_case symbols.
- **Zero-Dependency Debounce** (issue #53):
  - Replaced external `debounce` npm package with a custom, typed, zero-dependency debouncer implementation with full unit test coverage.
  - Unified search input and item loading debouncing into a single reactive event listener.
- **Dependency & Security Upgrades**:
  - Pulled in security updates for `minimist` (1.2.8) and `minimatch` (3.1.5), closing Dependabot PRs #38 and #39.
  - Safely updated `typescript` to 4.9.5, `@types/node` to 16.x, `@types/mocha` to 10.x, and `@types/chai` to 4.3.20.

## [3.0.0] - 2026-10-05
### 🚀 The Next-Gen Engine: SQLite WASM & Ultra-Fast Big-Repo Search
- **SQLite WASM Architecture**: Replaced in-memory JavaScript heap cache with an embedded SQLite WebAssembly engine (`sql.js`) backed by specialized B-Tree indexes.
- **Blazing Fast Performance**:
  - Sub-millisecond queries: Search response time reduced to **~0.20 ms** via index-covering queries (`idx_symbols_name_nocase`).
  - Instant LRU Query Cache: Repeat queries, backspaces, and prefix refinements execute in **0.00 ms**.
  - Search input debounce optimized from 200 ms to 50 ms for an ultra-responsive UI experience.
- **Massive Scalability & 95% RAM Reduction**:
  - Easily indexes and searches large enterprise workspaces with **over 2,000,000 symbols**.
  - Peak RAM consumption dropped from **> 1.5 GB down to < 80 MB** thanks to streaming batch indexing directly to SQLite in 2,500-symbol chunks.
  - Eliminated memory spikes and UI freezes caused by large JSON serializations in multi-project workspaces.
- **Real-Time Live Symbol Synchronization**:
  - Live change detection debounced to 300 ms with instantaneous workspace folder lookups (`0.00 ms`). Newly typed functions, classes, and variables appear in search results immediately without editor lag.
- **Fine-Grained AST Filtering**:
  - Added `searchEverywhere.excludeProperties` (default `true`) to strip millions of noisy object properties.
  - Added `searchEverywhere.excludeVariables` (default `false`) ensuring variables, constants, and React functional components remain fully searchable.
- **Multi-Root Workspace Support**:
  - Seamless indexing across multiple workspace folders with dynamic common path resolution on folder addition or removal.
- **Bug Fixes**:
  - Fixed `searchEverywhere.shouldItemsBeSorted` honoring alphabetical vs. categorized symbol order for empty queries.
  - Fixed dynamic reload of QuickPick results when toggling separator grouping.
  - Standardized all UI toasts, status bar notifications, and progress messages to English.
  - Optimized packaging: excluded benchmarks and test scripts, bundling only essential runtime files and `sql-wasm.wasm`.

## [2.1.0] - 2023-02-03
- Feat: ability to decide whether selection in the active editor is put in the search (#PR33)

## [2.0.2] - 2022-09-07
- Fix issue with invisible quick pick icons

## [2.0.0] - 2022-09-07
- Fully rewritten from class based to function based approach
- Test improvements
- Minimum version of vscode set to 1.64.0
- Feat: item icon to open it to the side
- Feat: dedicated output with logs related to triggered actions, scanned directories structure, etc.
- Feat: ability to decide whether the items should be sorted by type
- Feat: ability to cache the scanned workspaceData to as a result scan the workspace only once

## [1.2.2] - 2022-02-18
- Fixed issue related to not refreshing include patterns on configuration change

## [1.2.1] - 2021-12-09
- Renamed QuickPick kind property to symbolKind due to new vscode QuickPick API (version 1.63.0)
## [1.2.0] - 2021-08-16
- Added stats message (elapsed time, number of scanned files, number of indexed items) displayed after indexing the workspace
- Replaced fileWatcher events with workspace event listeners for files / folders manipulation which results in better performance and stability
## [1.1.0] - 2021-07-19
- Setting `searchEverywhere.shouldUseFilesAndSearchExclude` replaced with `searchEverywhere.excludeMode` allowing to choose source of exclude patterns: extension, files and search, gitignore
- Added debouncing for handleDidChangeTextDocument event callback
- Added caching for handleDidChangeTextDocument event callback to general increase performance
## [1.0.9] - 2021-05-24
- Fixed bug concerning loading items to not existing quick pick on handleDidProcessing callback. QuickPick initialization moved to handleWillProcessing callback,
- Fixed bug concerning updating list after removing whole folder with multiple files,
- Added distinguishing different path of projects in workspace if there is more than one.

## [1.0.8] - 2021-02-26
- Some internals have been rewritten to improve the stability.

## [1.0.5] - 2020-09-03
- Fixed bug with nested alternate groups in include glob pattern which are not allowed. Changed include type from string[] to string.

## [1.0.0] - 2020-07-09
- Initial release

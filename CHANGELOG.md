# Change Log

All notable changes to the "vscode-search-everywhere" extension will be documented in this file.

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

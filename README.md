# Search everywhere

The extension is inspired by JetBrains IDEs feature "Search Everywhere".
It allows user to easily navigate through files and symbols in the whole workspace.

It is the alternative for "Go to Symbol in Workspace..." - fully customizable.


Version 2.0.0 - rewritten with several fancy new features.

## How it works

The extension indexes the whole workspace. It scans both files and all symbols for each file according to set up patterns in settings. The scan can be initialized automatically on startup of Visual Studio Code or postponed till the first launch of extension.

After the scan is completed, the extension listens for any change in the workplace, e.g.

* add, rename, delete function, variable or anything other in file
* add, rename, delete, move a file between directories or even between projects in the opened workspace

The above guarantees that the data is always up to date.


Worth mentioning is the optimization of scanning algorithm. It queues every change and reduces not necessary actions to assure the scan is smooth and very quick.

Additionally from version 2.0.0 there is a feature to scan the workspace only once and cache the results. Useful especially with the bigger projects.




![How it works](img/how-it-works.gif)

## Features

* Init on startup or first call

* Notification placeholder

  toast

  ![Notification in toast](img/notification-toast.gif)

  status bar

  ![Notification in status bar](img/notification-status-bar.gif)



* Debounce of search results while filtering

  enabled

  ![Debounce enabled](img/debounce-on.gif)


  disabled

  ![Debounce disabled](img/debounce-off.gif)


* Highlight of selected symbol

  enabled

  ![Highlight enabled](img/highlight-on.gif)


  disabled

  ![Highlight disabled](img/highlight-off.gif)

* Customizable icon for each item type

* Customizable filter phrase for each item type

  ![Filter phrase](img/filter-phrases.gif)

* Customizable items filter to reduce items set

* Customizable help phrase

* Customizable exclude patterns

* Customizable include pattern

* Ability to decide whether use extension exclude patterns or "Files: Exclude" and "Search: Exclude" patterns

* Item icon to open it to the side

* Dedicated output with logs related to triggered actions, scanned directories structure, etc.

* Ability to decide whether the items should be sorted by type

* Ability to cache the scanned workspaceData to as a result scan the workspace only once

## Commands

* `searchEverywhere.search`

  Search any symbol/file in the currently opened workspace.

  Default keybinding for the command is:
  * mac: `alt + cmd + p`
  * win/linux: `ctrl + alt + p`

* `searchEverywhere.reload`

  Re-index the whole workspace.

## Extension Settings

* `searchEverywhere.shouldInitOnStartup`

Should indexing be initialized on Visual Studio Code startup.
Default value: `false`.

* `searchEverywhere.shouldDisplayNotificationInStatusBar`

Should display indexing notification in toast or status bar.
Default value: `false`.

* `searchEverywhere.shouldHighlightSymbol`

Should the selected symbol be highlighted.
Default value: `false`.

* `searchEverywhere.shouldUseDebounce`

Should the debounce function be used while returning filter results (useful in case of the large workspace).
Default value: `true`.

* `searchEverywhere.icons`

Ability to define icons that should be displayed for appropriate item types. According to VSC API, only Octicons are allowed. Not defined item type will not have any icon.

Default value:
```json
{
  "0": "symbol-file",
  "1": "file-submodule",
  "2": "symbol-namespace",
  "3": "package",
  "4": "symbol-class",
  "5": "symbol-method",
  "6": "symbol-property",
  "7": "symbol-field",
  "8": "symbol-ruler",
  "9": "symbol-enum",
  "10": "symbol-interface",
  "11": "variable-group",
  "12": "symbol-variable",
  "13": "symbol-constant",
  "14": "symbol-string",
  "15": "symbol-numeric",
  "16": "symbol-boolean",
  "17": "symbol-array",
  "18": "symbol-keyword",
  "19": "symbol-key",
  "20": "remove",
  "21": "symbol-enum-member",
  "22": "symbol-structure",
  "23": "symbol-event",
  "24": "symbol-operator",
  "25": "type-hierarchy-sub"
}
```

Below you can find the table with information which symbol kind refers to which symbol name:

| kind | icon               | symbol name    |
|------|:------------------:|:--------------:|
|   0  | symbol-file        | file           |
|   1  | file-submodule     | module         |
|   2  | symbol-namespace   | namespace      |
|   3  | package            | package        |
|   4  | symbol-class       | class          |
|   5  | symbol-method      | method         |
|   6  | symbol-property    | property       |
|   7  | symbol-field       | field          |
|   8  | symbol-ruler       | constructor    |
|   9  | symbol-enum        | enum           |
|  10  | symbol-interface   | interface      |
|  11  | variable-group     | function       |
|  12  | symbol-variable    | variable       |
|  13  | symbol-constant    | constant       |
|  14  | symbol-string      | string         |
|  15  | symbol-numeric     | number         |
|  16  | symbol-boolean     | boolean        |
|  17  | symbol-array       | array          |
|  18  | symbol-keyword     | object         |
|  19  | symbol-key         | key            |
|  20  | remove             | null           |
|  21  | symbol-enum-member | enum member    |
|  22  | symbol-structure   | struct         |
|  23  | symbol-event       | event          |
|  24  | symbol-operator    | operator       |
|  25  | type-hierarchy-sub | type parameter |

* `searchEverywhere.itemsFilter`

Ability to define a filter that should be applied to items.
All kinds can be find here: https://code.visualstudio.com/api/references/vscode-api#SymbolKind

Default value:

```json
{
  "allowedKinds": [],
  "ignoredKinds": [],
  "ignoredNames": []
}
```

Below is an example which will remove from items all arrays (17), booleans (16) and the ones containing "foo" string in the name:

```json
{
  "allowedKinds": [],
  "ignoredKinds": [16, 17],
  "ignoredNames": ["foo"]
}
```

* `searchEverywhere.shouldUseItemsFilterPhrases`

Should be a possibility to filter by assigned filter phrases.
Default value: `true`.


* `searchEverywhere.itemsFilterPhrases`

Phrases for item type which could be used for narrowing the results down.

Default value:

```json
{
  "0": "$$",
  "4": "@@",
  "11": "!!",
  "14": "##",
  "17": "%%"
}
```

* `searchEverywhere.helpPhrase`

A phrase which should invoke help.
Default value: `?`

* `searchEverywhere.shouldItemsBeSorted`

Ability to decide whether items should be sorted by type.
Default value: `true`

* `searchEverywhere.exclude`

An array of globs. Any file matching these globs will be excluded from indexing.

Default value:

```json
[
  "**/.git",
  "**/.svn",
  "**/.hg",
  "**/.CVS",
  "**/.DS_Store",
  "**/package-lock.json",
  "**/yarn.lock",
  "**/node_modules/**",
  "**/bower_components/**",
  "**/coverage/**",
  "**/.vscode/**",
  "**/.vscode-test/**",
  "**/.history/**",
  "**/.cache/**",
  "**/.cache-loader/**",
  "**/out/**",
  "**/dist/**"
]
```

* `searchEverywhere.include`

String with include pattern. Any file matching this glob will be included in indexing.

Default value:

```json
"**/*.{js,jsx,ts,tsx}"
```

* `searchEverywhere.excludeMode`

Ability to choose which exclude option should be applied. If gitignore file is not found or is empty, the extension option is used as a fallback. Available options: `search everywhere`, `files and search`, `gitignore`. To see the changes from the updated gitignore file after indexing, the reload must be done.
Default value: `search everywhere`.

* `searchEverywhere.shouldWorkspaceDataBeCached`

Ability to decide if the workspace should be indexed only once. Each next startup of Visual Studio Code will collect data from cache.
Default value: `true`

* `searchEverywhere.shouldSearchSelection`

Ability to decide whether selection in the active editor is put in the search.
Default value: `true`

## Release Notes

Please check changelog for release details.

## How to run it locally

If you would like to run the extension locally, go through the following steps:

  1. clone the repository
  2. run `npm install` to install all dependencies
  3. open `run and debug` view
  4. run `run extension`
  5. enjoy development!

## Author

[Kamil Bysiec](https://github.com/kbysiec)

## Acknowledgment

If you found it useful somehow, I would be grateful if you could leave a "Rating & Review" in Marketplace or/and leave a star in the project's GitHub repository.

Thank you.

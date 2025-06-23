"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIndexStats = exports.getItemsFilter = exports.getProgress = exports.getSubscription = exports.getEventEmitter = exports.getActions = exports.getAction = exports.getWorkspaceData = exports.getVscodeConfiguration = exports.getConfiguration = exports.getExtensionContext = void 0;
const sinon = require("sinon");
const vscode = require("vscode");
const types_1 = require("../../src/types");
const getExtensionContext = () => {
    return {
        subscriptions: [],
        workspaceState: {
            get: () => { },
            update: () => Promise.resolve(),
            keys: () => [],
        },
        globalState: {
            get: () => { },
            update: () => Promise.resolve(),
            keys: () => [],
            setKeysForSync: (keys) => { },
        },
        extensionPath: "",
        storagePath: "",
        globalStoragePath: "",
        logPath: "",
        secrets: {
            get: () => Promise.resolve(),
            store: () => Promise.resolve(),
            delete: () => Promise.resolve(),
        },
        extensionUri: undefined,
        storageUri: undefined,
        globalStorageUri: undefined,
        logUri: undefined,
        environmentVariableCollection: undefined,
        extensionMode: undefined,
        extension: undefined,
        asAbsolutePath: (relativePath) => relativePath,
    };
};
exports.getExtensionContext = getExtensionContext;
const getConfiguration = () => {
    return {
        searchEverywhere: {
            shouldInitOnStartup: true,
            shouldDisplayNotificationInStatusBar: true,
            shouldHighlightSymbol: true,
            shouldUseDebounce: true,
            icons: { 0: "fake-icon", 1: "another-fake-icon" },
            itemsFilter: {
                allowedKinds: [1, 2, 3],
                ignoredKinds: [],
                ignoredNames: ["demo"],
            },
            shouldUseItemsFilterPhrases: true,
            itemsFilterPhrases: {
                "0": "$$",
                "1": "^^",
                "4": "@@",
            },
            helpPhrase: "?",
            shouldItemsBeSorted: true,
            shouldSearchSelection: true,
            include: "**/*.{js,ts}",
            exclude: ["**/node_modules/**"],
            excludeMode: types_1.ExcludeMode.SearchEverywhere,
            shouldWorkspaceDataBeCached: true,
        },
        customSection: {
            exclude: ["**/customFolder/**"],
        },
        search: {
            exclude: {
                "**/search_exclude/**": true,
            },
        },
        files: {
            exclude: {
                "**/.git": true,
            },
        },
    };
};
exports.getConfiguration = getConfiguration;
const getVscodeConfiguration = (configuration) => {
    return {
        get: (section) => section.split(".").reduce((cfg, key) => cfg[key], configuration),
        has: () => true,
        inspect: () => undefined,
        update: () => Promise.resolve(),
    };
};
exports.getVscodeConfiguration = getVscodeConfiguration;
const getWorkspaceData = (items = []) => {
    let count = 0;
    const itemsMap = new Map();
    items.forEach((item) => {
        itemsMap.set(item.uri.path, {
            uri: item.uri,
            elements: item.elements,
        });
        count += item.elements.length;
    });
    return {
        items: itemsMap,
        count,
    };
};
exports.getWorkspaceData = getWorkspaceData;
const getRandomActionType = () => {
    const count = Object.keys(types_1.ActionType).length;
    const randomIndex = Math.round(Math.random() * count);
    return Object.values(types_1.ActionType)[randomIndex];
};
const getAction = (type, trigger = "test trigger", id = 0, withUri = false, uri = vscode.Uri.file(`./fake/fake-${id}.ts`)) => {
    return {
        type: type || getRandomActionType(),
        fn: sinon.stub(),
        trigger: trigger,
        id,
        uri: withUri ? uri : undefined,
    };
};
exports.getAction = getAction;
const getActions = (count = 2, action, type, trigger, withUri, uri) => {
    const array = [];
    for (let i = 1; i <= count; i++) {
        if (action) {
            array.push(action);
        }
        else {
            array.push((0, exports.getAction)(type, `${trigger} ${i}`, i - 1, withUri, uri));
        }
    }
    return array;
};
exports.getActions = getActions;
const getEventEmitter = () => ({ fire: sinon.stub() });
exports.getEventEmitter = getEventEmitter;
const getSubscription = () => ({ dispose: sinon.stub() });
exports.getSubscription = getSubscription;
const getProgress = (value = 0) => ({
    report: sinon.stub(),
    value,
});
exports.getProgress = getProgress;
const getItemsFilter = (allowedKinds = [], ignoredKinds = [], ignoredNames = []) => {
    return {
        allowedKinds,
        ignoredKinds,
        ignoredNames,
    };
};
exports.getItemsFilter = getItemsFilter;
const getIndexStats = () => {
    const indexStats = {
        ElapsedTimeInSeconds: 3,
        ScannedUrisCount: 20,
        IndexedItemsCount: 120,
    };
    return indexStats;
};
exports.getIndexStats = getIndexStats;
//# sourceMappingURL=mockFactory.js.map
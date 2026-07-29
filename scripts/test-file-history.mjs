/**
 * Tests for file save history utilities.
 * Run: node scripts/test-file-history.mjs
 */
import {
    USER_NAME_STORAGE_KEY,
    MAX_FILE_HISTORY_ENTRIES,
    DEFAULT_HISTORY_USER_NAME,
    getUserName,
    setUserName,
    clearFileHistoryStore,
    replaceFileHistoryStore,
    appendFileHistoryEntry,
    getUserNameForHistory,
    promptUserNameForSaveIfEmpty,
    getFileHistoryForExport,
    getFileHistoryStore,
    importFileHistoryFromGltfScene,
    stripFileHistoryFromGltfScene,
    formatFileHistoryEntry,
    formatFileHistoryForDialog,
} from '../src/fileHistoryUtils.js';

function assert(cond, msg) {
    if (!cond) throw new Error(msg);
}

function createMockGltfScene(userData = {}) {
    const root = {
        userData: { ...userData },
        traverse(fn) {
            fn(this);
        },
    };
    return root;
}

// localStorage mock for getUserName / setUserName
const storage = new Map();
globalThis.localStorage = {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); },
};
globalThis.window = { prompt: () => null };

clearFileHistoryStore();
storage.clear();

// User name round-trip
setUserName('  Alice  ');
assert(getUserName() === 'Alice', 'getUserName trims stored value');
assert(storage.get(USER_NAME_STORAGE_KEY) === 'Alice', 'setUserName persists');

setUserName('');
assert(getUserName() === '', 'empty user name clears');
assert(!storage.has(USER_NAME_STORAGE_KEY), 'empty user name removes key');

// Empty name → noname in history only
clearFileHistoryStore();
appendFileHistoryEntry('');
assert(getFileHistoryStore()[0].user === DEFAULT_HISTORY_USER_NAME, 'empty append uses noname');
assert(getUserName() === '', 'append noname does not set user name');
assert(getUserNameForHistory() === DEFAULT_HISTORY_USER_NAME, 'getUserNameForHistory fallback');

setUserName('Eve');
assert(getUserNameForHistory() === 'Eve', 'getUserNameForHistory uses stored name');

// Append and export copy
clearFileHistoryStore();
appendFileHistoryEntry('Bob');
const exported = getFileHistoryForExport();
assert(exported.length === 1, 'one history entry after append');
assert(exported[0].user === 'Bob', 'exported user name');
assert(typeof exported[0].savedAt === 'string', 'exported savedAt');

exported[0].user = 'Hacked';
assert(getFileHistoryStore()[0].user === 'Bob', 'export returns a copy');

// Max entries limit
clearFileHistoryStore();
for (let i = 0; i < MAX_FILE_HISTORY_ENTRIES + 5; i++) {
    appendFileHistoryEntry(`User${i}`);
}
const store = getFileHistoryStore();
assert(store.length === MAX_FILE_HISTORY_ENTRIES, 'history capped at MAX_FILE_HISTORY_ENTRIES');
assert(store[0].user === 'User5', 'oldest entries trimmed');

// replaceFileHistoryStore validation
clearFileHistoryStore();
replaceFileHistoryStore([
    { user: 'Valid', savedAt: '2026-01-01T00:00:00.000Z' },
    { user: '', savedAt: '2026-01-02T00:00:00.000Z' },
    { user: 'NoDate' },
    null,
    { user: '  Trimmed  ', savedAt: '2026-01-03T00:00:00.000Z' },
]);
assert(getFileHistoryStore().length === 2, 'invalid entries filtered');
assert(getFileHistoryStore()[1].user === 'Trimmed', 'entries normalized');

// importFileHistoryFromGltfScene
clearFileHistoryStore();
const sceneWithHistory = createMockGltfScene({
    fileHistory: [
        { user: 'Carol', savedAt: '2026-02-01T12:00:00.000Z' },
    ],
});
importFileHistoryFromGltfScene(sceneWithHistory);
assert(getFileHistoryStore().length === 1, 'import replaces store');
assert(getFileHistoryStore()[0].user === 'Carol', 'imported user');
assert(sceneWithHistory.userData.fileHistory === undefined, 'import strips fileHistory from scene');

// stripFileHistoryFromGltfScene without import
clearFileHistoryStore();
appendFileHistoryEntry('SessionUser');
const sceneToStrip = createMockGltfScene({
    fileHistory: [{ user: 'Foreign', savedAt: '2026-03-01T00:00:00.000Z' }],
});
stripFileHistoryFromGltfScene(sceneToStrip);
assert(getFileHistoryStore()[0].user === 'SessionUser', 'strip does not change session store');
assert(sceneToStrip.userData.fileHistory === undefined, 'strip removes fileHistory from scene');

// formatFileHistoryEntry
const formatted = formatFileHistoryEntry({
    user: 'Dave',
    savedAt: '2026-04-15T10:30:00.000Z',
});
assert(formatted.startsWith('Dave — '), 'formatted entry includes user');

// formatFileHistoryForDialog — oldest first
clearFileHistoryStore();
replaceFileHistoryStore([
    { user: 'Older', savedAt: '2026-01-01T00:00:00.000Z' },
    { user: 'Newer', savedAt: '2026-02-01T00:00:00.000Z' },
]);
const dialogText = formatFileHistoryForDialog();
assert(dialogText.startsWith('1. Older'), 'dialog lists oldest entry first');
assert(dialogText.includes('2. Newer'), 'dialog lists newest entry last');

// promptUserNameForSaveIfEmpty
setUserName('Frank');
let promptCalls = 0;
globalThis.window.prompt = () => { promptCalls++; return null; };
assert(promptUserNameForSaveIfEmpty() === true, 'skip prompt when name already set');
assert(promptCalls === 0, 'no prompt when name already set');

setUserName('');
promptCalls = 0;
globalThis.window.prompt = () => { promptCalls++; return null; };
assert(promptUserNameForSaveIfEmpty() === false, 'Cancel in prompt aborts save');
assert(promptCalls === 1, 'prompt shown when name empty');
assert(getUserName() === '', 'Cancel does not set user name');

setUserName('');
globalThis.window.prompt = () => '';
assert(promptUserNameForSaveIfEmpty() === true, 'empty OK continues save');
assert(getUserName() === '', 'empty OK does not set user name');

setUserName('');
globalThis.window.prompt = () => '  Bob  ';
assert(promptUserNameForSaveIfEmpty() === true, 'name entry continues save');
assert(getUserName() === 'Bob', 'prompt trims and stores user name');

console.log('All file-history tests passed.');

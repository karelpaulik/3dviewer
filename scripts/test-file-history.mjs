/**
 * Tests for file save history utilities.
 * Run: node scripts/test-file-history.mjs
 */
import {
    USER_NAME_STORAGE_KEY,
    MAX_FILE_HISTORY_ENTRIES,
    MAX_COMMENT_LENGTH,
    DEFAULT_HISTORY_USER_NAME,
    getUserName,
    setUserName,
    clearFileHistoryStore,
    replaceFileHistoryStore,
    appendFileHistoryEntry,
    isFileHistoryOnSaveEnabled,
    setFileHistoryOnSaveEnabled,
    resetFileHistoryOnSaveEnabled,
    recordSaveHistoryIfEnabled,
    getUserNameForHistory,
    resolveSaveHistoryEntry,
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

// Append with comment
clearFileHistoryStore();
appendFileHistoryEntry('Alice', 'Fixed dims');
assert(getFileHistoryForExport()[0].comment === 'Fixed dims', 'append stores comment');
appendFileHistoryEntry('Bob', '');
assert(getFileHistoryForExport()[1].comment === undefined, 'empty comment omitted');

// Comment length limit
clearFileHistoryStore();
appendFileHistoryEntry('User', 'x'.repeat(MAX_COMMENT_LENGTH + 50));
assert(getFileHistoryStore()[0].comment.length === MAX_COMMENT_LENGTH, 'comment trimmed to max length');

// resolveSaveHistoryEntry
const resolved = resolveSaveHistoryEntry('  Name  ', '  note  ');
assert(resolved.user === 'Name', 'resolveSaveHistoryEntry trims name');
assert(resolved.comment === 'note', 'resolveSaveHistoryEntry trims comment');
const resolvedEmpty = resolveSaveHistoryEntry('', '');
assert(resolvedEmpty.user === '', 'resolveSaveHistoryEntry allows empty name');
assert(resolvedEmpty.comment === undefined, 'resolveSaveHistoryEntry omits empty comment');

// Append and export copy
clearFileHistoryStore();
appendFileHistoryEntry('Bob');
const exported = getFileHistoryForExport();
assert(exported.length === 1, 'one history entry after append');
assert(exported[0].user === 'Bob', 'exported user name');
assert(typeof exported[0].savedAt === 'string', 'exported savedAt');

exported[0].user = 'Hacked';
assert(getFileHistoryStore()[0].user === 'Bob', 'export returns a copy');

// Clear all history
clearFileHistoryStore();
appendFileHistoryEntry('Alice', 'note');
clearFileHistoryStore();
assert(getFileHistoryStore().length === 0, 'clearFileHistoryStore empties store');
assert(getFileHistoryForExport().length === 0, 'export after clear is empty');

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
    { user: '  Trimmed  ', savedAt: '2026-01-03T00:00:00.000Z', comment: '  kept  ' },
]);
assert(getFileHistoryStore().length === 2, 'invalid entries filtered');
assert(getFileHistoryStore()[1].user === 'Trimmed', 'entries normalized');
assert(getFileHistoryStore()[1].comment === 'kept', 'comment preserved on import');

// importFileHistoryFromGltfScene
clearFileHistoryStore();
const sceneWithHistory = createMockGltfScene({
    fileHistory: [
        { user: 'Carol', savedAt: '2026-02-01T12:00:00.000Z', comment: 'Initial' },
    ],
});
importFileHistoryFromGltfScene(sceneWithHistory);
assert(getFileHistoryStore().length === 1, 'import replaces store');
assert(getFileHistoryStore()[0].user === 'Carol', 'imported user');
assert(getFileHistoryStore()[0].comment === 'Initial', 'imported comment');
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

const formattedWithComment = formatFileHistoryEntry({
    user: 'Dave',
    savedAt: '2026-04-15T10:30:00.000Z',
    comment: 'Adjusted bracket',
});
assert(formattedWithComment.endsWith('— Adjusted bracket'), 'formatted entry includes comment');

// formatFileHistoryForDialog — oldest first
clearFileHistoryStore();
replaceFileHistoryStore([
    { user: 'Older', savedAt: '2026-01-01T00:00:00.000Z' },
    { user: 'Newer', savedAt: '2026-02-01T00:00:00.000Z' },
]);
const dialogText = formatFileHistoryForDialog();
assert(dialogText.startsWith('1. Older'), 'dialog lists oldest entry first');
assert(dialogText.includes('2. Newer'), 'dialog lists newest entry last');

// file history on save session flag
setFileHistoryOnSaveEnabled(false);
assert(isFileHistoryOnSaveEnabled() === false, 'setFileHistoryOnSaveEnabled false');
setFileHistoryOnSaveEnabled(true);
assert(isFileHistoryOnSaveEnabled() === true, 'setFileHistoryOnSaveEnabled true');
setFileHistoryOnSaveEnabled(false);
resetFileHistoryOnSaveEnabled();
assert(isFileHistoryOnSaveEnabled() === true, 'resetFileHistoryOnSaveEnabled');

// recordSaveHistoryIfEnabled when disabled skips dialog
clearFileHistoryStore();
setFileHistoryOnSaveEnabled(false);
const recordedWithoutDialog = await recordSaveHistoryIfEnabled();
assert(recordedWithoutDialog === true, 'recordSaveHistoryIfEnabled true when toggle off');
assert(getFileHistoryStore().length === 0, 'no entry when toggle off');
resetFileHistoryOnSaveEnabled();

console.log('All file-history tests passed.');

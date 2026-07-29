/**
 * File save history and local user name (no cloud).
 * Persisted in GLB userData.fileHistory on export; user name in localStorage.
 */

export const USER_NAME_STORAGE_KEY = 'meshbex-user-name';
export const MAX_FILE_HISTORY_ENTRIES = 100;
export const DEFAULT_HISTORY_USER_NAME = 'noname';

/** @type {Array<{ user: string, savedAt: string }>} */
let fileHistoryStore = [];

/** @type {HTMLInputElement | null} */
let _toolbarUsernameInput = null;

function isValidEntry(entry) {
    return entry
        && typeof entry.user === 'string'
        && entry.user.trim().length > 0
        && typeof entry.savedAt === 'string'
        && entry.savedAt.length > 0;
}

function normalizeEntries(entries) {
    if (!Array.isArray(entries)) return [];
    return entries.filter(isValidEntry).map(e => ({
        user: e.user.trim(),
        savedAt: e.savedAt,
    }));
}

export function getUserName() {
    try {
        return (localStorage.getItem(USER_NAME_STORAGE_KEY) || '').trim();
    } catch (_) {
        return '';
    }
}

export function setUserName(name) {
    const trimmed = (name || '').trim();
    try {
        if (trimmed) {
            localStorage.setItem(USER_NAME_STORAGE_KEY, trimmed);
        } else {
            localStorage.removeItem(USER_NAME_STORAGE_KEY);
        }
    } catch (_) { /* ignore */ }
    if (_toolbarUsernameInput && _toolbarUsernameInput.value !== trimmed) {
        _toolbarUsernameInput.value = trimmed;
    }
    return trimmed;
}

export function registerToolbarUsernameInput(inputEl) {
    _toolbarUsernameInput = inputEl;
}

/**
 * Prompt for user name when saving if none is set. Name is optional.
 * @returns {boolean} false when user cancels Save (Cancel in prompt)
 */
export function promptUserNameForSaveIfEmpty() {
    if (getUserName()) return true;

    const entered = window.prompt(
        'Enter your name for save history (optional, leave empty for anonymous):',
        ''
    );
    if (entered === null) return false;

    const trimmed = entered.trim();
    if (trimmed) setUserName(trimmed);
    return true;
}

/**
 * User name for a history record. Empty toolbar/localStorage → "noname".
 * Does not persist "noname" into localStorage or the toolbar input.
 */
export function getUserNameForHistory() {
    const name = getUserName();
    return name || DEFAULT_HISTORY_USER_NAME;
}

export function getFileHistoryStore() {
    return fileHistoryStore.slice();
}

export function clearFileHistoryStore() {
    fileHistoryStore = [];
}

export function replaceFileHistoryStore(entries) {
    fileHistoryStore = normalizeEntries(entries);
}

export function appendFileHistoryEntry(user) {
    const trimmed = (user || '').trim();
    const resolved = trimmed || DEFAULT_HISTORY_USER_NAME;

    fileHistoryStore.push({
        user: resolved,
        savedAt: new Date().toISOString(),
    });

    if (fileHistoryStore.length > MAX_FILE_HISTORY_ENTRIES) {
        fileHistoryStore = fileHistoryStore.slice(-MAX_FILE_HISTORY_ENTRIES);
    }
}

export function getFileHistoryForExport() {
    return fileHistoryStore.map(e => ({ ...e }));
}

function findFileHistoryOnScene(gltfScene) {
    let history = null;
    gltfScene.traverse(node => {
        if (Array.isArray(node.userData.fileHistory) && node.userData.fileHistory.length > 0) {
            if (!history) history = node.userData.fileHistory;
        }
    });
    return history;
}

function deleteFileHistoryFromScene(gltfScene) {
    gltfScene.traverse(node => {
        if (node.userData.fileHistory !== undefined) {
            delete node.userData.fileHistory;
        }
    });
}

export function importFileHistoryFromGltfScene(gltfScene) {
    const history = findFileHistoryOnScene(gltfScene);
    deleteFileHistoryFromScene(gltfScene);
    if (history) {
        replaceFileHistoryStore(history);
    }
}

export function stripFileHistoryFromGltfScene(gltfScene) {
    deleteFileHistoryFromScene(gltfScene);
}

export function formatFileHistoryEntry(entry) {
    if (!isValidEntry(entry)) return '';
    const date = new Date(entry.savedAt);
    const when = Number.isNaN(date.getTime())
        ? entry.savedAt
        : date.toLocaleString();
    return `${entry.user} — ${when}`;
}

export function formatFileHistoryForDialog() {
    if (fileHistoryStore.length === 0) return 'No save history yet.';
    return fileHistoryStore
        .map((entry, i) => `${i + 1}. ${formatFileHistoryEntry(entry)}`)
        .join('\n');
}

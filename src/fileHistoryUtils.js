/**
 * File save history and local user name (no cloud).
 * Persisted in GLB userData.fileHistory on export; user name in localStorage.
 */

export const USER_NAME_STORAGE_KEY = 'meshbex-user-name';
export const MAX_FILE_HISTORY_ENTRIES = 100;
export const MAX_COMMENT_LENGTH = 500;
export const DEFAULT_HISTORY_USER_NAME = 'noname';

/** @type {Array<{ user: string, savedAt: string, comment?: string }>} */
let fileHistoryStore = [];

/** @type {HTMLInputElement | null} */
let _toolbarUsernameInput = null;

/** @type {HTMLDialogElement | null} */
let _saveHistoryDialog = null;
/** @type {HTMLInputElement | null} */
let _saveHistoryNameInput = null;
/** @type {HTMLTextAreaElement | null} */
let _saveHistoryCommentInput = null;
/** @type {((value: { user: string, comment?: string } | null) => void) | null} */
let _saveHistoryResolve = null;

let _enableFileHistoryOnSave = true;

export function isFileHistoryOnSaveEnabled() {
    return _enableFileHistoryOnSave;
}

export function setFileHistoryOnSaveEnabled(enabled) {
    _enableFileHistoryOnSave = !!enabled;
}

export function resetFileHistoryOnSaveEnabled() {
    _enableFileHistoryOnSave = true;
}

export function isSaveHistoryDialogOpen() {
    return !!(_saveHistoryDialog && _saveHistoryDialog.open);
}

function clampSaveHistoryDialogPosition(left, top) {
    if (!_saveHistoryDialog) return { left, top };
    const margin = 8;
    const w = _saveHistoryDialog.offsetWidth || 320;
    const h = _saveHistoryDialog.offsetHeight || 240;
    return {
        left: Math.min(Math.max(margin, left), window.innerWidth - w - margin),
        top: Math.min(Math.max(margin, top), window.innerHeight - h - margin),
    };
}

function resetSaveHistoryDialogPosition() {
    if (!_saveHistoryDialog) return;
    _saveHistoryDialog.style.margin = '';
    _saveHistoryDialog.style.position = '';
    _saveHistoryDialog.style.left = '';
    _saveHistoryDialog.style.top = '';
}

function _initSaveHistoryDialogDrag() {
    if (!_saveHistoryDialog) return;
    const header = _saveHistoryDialog.querySelector('.save-history-header');
    if (!header || header.dataset.dragInit === '1') return;
    header.dataset.dragInit = '1';

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    header.addEventListener('mousedown', e => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();

        const rect = _saveHistoryDialog.getBoundingClientRect();
        _saveHistoryDialog.style.margin = '0';
        _saveHistoryDialog.style.position = 'fixed';
        _saveHistoryDialog.style.left = `${rect.left}px`;
        _saveHistoryDialog.style.top = `${rect.top}px`;

        dragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = rect.left;
        startTop = rect.top;
        _saveHistoryDialog.classList.add('save-history-dragging');
    });

    window.addEventListener('mousemove', e => {
        if (!dragging || !_saveHistoryDialog) return;
        e.preventDefault();
        const next = clampSaveHistoryDialogPosition(
            startLeft + (e.clientX - startX),
            startTop + (e.clientY - startY)
        );
        _saveHistoryDialog.style.left = `${next.left}px`;
        _saveHistoryDialog.style.top = `${next.top}px`;
    });

    window.addEventListener('mouseup', () => {
        if (!dragging || !_saveHistoryDialog) return;
        dragging = false;
        _saveHistoryDialog.classList.remove('save-history-dragging');
    });
}

function isValidEntry(entry) {
    return entry
        && typeof entry.user === 'string'
        && entry.user.trim().length > 0
        && typeof entry.savedAt === 'string'
        && entry.savedAt.length > 0;
}

function normalizeComment(comment) {
    if (typeof comment !== 'string') return undefined;
    const trimmed = comment.trim().slice(0, MAX_COMMENT_LENGTH);
    return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeEntries(entries) {
    if (!Array.isArray(entries)) return [];
    return entries.filter(isValidEntry).map(e => {
        const normalized = {
            user: e.user.trim(),
            savedAt: e.savedAt,
        };
        const comment = normalizeComment(e.comment);
        if (comment) normalized.comment = comment;
        return normalized;
    });
}

/**
 * Pure helper for dialog result (testable without DOM).
 * @returns {{ user: string, comment?: string }}
 */
export function resolveSaveHistoryEntry(nameInput, commentInput) {
    const trimmedName = (nameInput || '').trim();
    const comment = normalizeComment(commentInput);
    const entry = { user: trimmedName };
    if (comment) entry.comment = comment;
    return entry;
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

function initSaveHistoryDialog() {
    if (_saveHistoryDialog) return;

    _saveHistoryDialog = document.createElement('dialog');
    _saveHistoryDialog.id = 'save-history-dialog';
    _saveHistoryDialog.setAttribute('closedby', 'closerequest');
    _saveHistoryDialog.innerHTML = `
        <form method="dialog" class="save-history-form">
            <div class="save-history-header">
                <h2>Save history</h2>
            </div>
            <label class="save-history-field">
                <span>Name (optional)</span>
                <input type="text" id="save-history-name" autocomplete="name" placeholder="Leave empty for anonymous">
            </label>
            <label class="save-history-field">
                <span>Change note (optional)</span>
                <textarea id="save-history-comment" rows="3" placeholder="What changed in this version?"></textarea>
            </label>
            <div class="save-history-footer">
                <button type="submit" value="cancel" id="save-history-cancel">Cancel</button>
                <button type="submit" value="confirm" id="save-history-confirm">Save</button>
            </div>
        </form>
    `;
    document.body.appendChild(_saveHistoryDialog);

    _saveHistoryNameInput = _saveHistoryDialog.querySelector('#save-history-name');
    _saveHistoryCommentInput = _saveHistoryDialog.querySelector('#save-history-comment');

    _saveHistoryDialog.addEventListener('cancel', e => {
        e.preventDefault();
        _saveHistoryDialog?.close('cancel');
    });
    _saveHistoryDialog.addEventListener('close', () => {
        const resolve = _saveHistoryResolve;
        _saveHistoryResolve = null;
        if (!resolve) return;

        if (_saveHistoryDialog.returnValue !== 'confirm') {
            resolve(null);
            return;
        }

        const entry = resolveSaveHistoryEntry(
            _saveHistoryNameInput?.value ?? '',
            _saveHistoryCommentInput?.value ?? ''
        );
        if (entry.user) setUserName(entry.user);
        resolve(entry);
    });

    _initSaveHistoryDialogDrag();
}

/**
 * Show save history dialog on every Save / Save As.
 * @returns {Promise<{ user: string, comment?: string } | null>} null when cancelled
 */
export function promptSaveHistoryEntry() {
    initSaveHistoryDialog();
    if (!_saveHistoryDialog || !_saveHistoryNameInput || !_saveHistoryCommentInput) {
        return Promise.resolve(null);
    }

    _saveHistoryNameInput.value = getUserName();
    _saveHistoryCommentInput.value = '';
    resetSaveHistoryDialogPosition();

    return new Promise(resolve => {
        _saveHistoryResolve = resolve;
        _saveHistoryDialog.showModal();
        _saveHistoryNameInput.focus();
        _saveHistoryNameInput.select();
    });
}

/**
 * Prompt and append save history when enabled.
 * @returns {Promise<boolean>} false when user cancels the history dialog
 */
export async function recordSaveHistoryIfEnabled() {
    if (!isFileHistoryOnSaveEnabled()) return true;
    const entry = await promptSaveHistoryEntry();
    if (!entry) return false;
    appendFileHistoryEntry(entry.user, entry.comment);
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

export function appendFileHistoryEntry(user, comment) {
    const trimmed = (user || '').trim();
    const resolved = trimmed || DEFAULT_HISTORY_USER_NAME;
    const normalizedComment = normalizeComment(comment);

    const entry = {
        user: resolved,
        savedAt: new Date().toISOString(),
    };
    if (normalizedComment) entry.comment = normalizedComment;

    fileHistoryStore.push(entry);

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
    const base = `${entry.user} — ${when}`;
    if (entry.comment) return `${base} — ${entry.comment}`;
    return base;
}

export function formatFileHistoryForDialog() {
    if (fileHistoryStore.length === 0) return 'No save history yet.';
    return fileHistoryStore
        .map((entry, i) => `${i + 1}. ${formatFileHistoryEntry(entry)}`)
        .join('\n');
}

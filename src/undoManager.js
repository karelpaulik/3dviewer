// undoManager.js — global undo/redo stack for 3D scene commands

const MAX_UNDO = 50;

let _undoStack = [];
let _redoStack = [];
let _onChange = null;
let _shouldDelegate = null;

/**
 * @param {{ onChange?: () => void, shouldDelegate?: () => boolean }} opts
 */
export function initUndoManager(opts = {}) {
    _onChange = opts.onChange || null;
    _shouldDelegate = opts.shouldDelegate || null;
}

function _notify() {
    _onChange?.();
}

/**
 * @param {{ label: string, undo: () => void, redo: () => void }} command
 */
export function pushCommand(command) {
    if (!command?.undo || !command?.redo) return;
    _undoStack.push(command);
    if (_undoStack.length > MAX_UNDO) _undoStack.shift();
    _redoStack.length = 0;
    _notify();
}

export function undo() {
    if (_shouldDelegate?.()) return false;
    const command = _undoStack.pop();
    if (!command) return false;
    command.undo();
    _redoStack.push(command);
    _notify();
    return true;
}

export function redo() {
    if (_shouldDelegate?.()) return false;
    const command = _redoStack.pop();
    if (!command) return false;
    command.redo();
    _undoStack.push(command);
    _notify();
    return true;
}

export function canUndo() {
    return _undoStack.length > 0;
}

export function canRedo() {
    return _redoStack.length > 0;
}

export function getUndoLabel() {
    const top = _undoStack[_undoStack.length - 1];
    return top?.label || '';
}

export function getRedoLabel() {
    const top = _redoStack[_redoStack.length - 1];
    return top?.label || '';
}

export function clearUndoHistory() {
    _undoStack.length = 0;
    _redoStack.length = 0;
    _notify();
}

export function isGlobalUndoActive() {
    return !_shouldDelegate?.();
}

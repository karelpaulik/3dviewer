// helpUtils.js
const HELP_JSON_PATH = '/help/help.json';

/**
 * Opens the help viewer in a new window.
 * @param {string} jsonPath - Path to the help JSON file (follows the documentsUtils export format).
 */
export function openHelp(jsonPath = HELP_JSON_PATH) {
    const url = '/help.html?doc=' + encodeURIComponent(jsonPath);
    const win = window.open(url, '_blank');
    if (win) win.focus();
}

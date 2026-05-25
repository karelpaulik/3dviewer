// bomUtils.js – Bill of Materials generator

const _bomState = {
    groupByName: true,
    includeGroups: true,
    includeMeshes: false,
    exportCols: [
        { key: 'no',    label: 'No.',   enabled: true },
        { key: 'name',  label: 'Name',  enabled: true },
        { key: 'type',  label: 'Type',  enabled: true },
        { key: 'qty',   label: 'Qty',   enabled: true },
        { key: 'depth', label: 'Depth', enabled: false },
    ],
};

const INDENT_PX = 18;

/**
 * Recursively build BOM rows as a flat array with a `depth` field for indentation.
 * Groups with "Include groups" ON appear as parent rows; their children are indented.
 * When "Group by name" is ON, direct siblings with the same name+type are merged (qty counted).
 */
function _buildTreeRows(root, includeGroups, includeMeshes, groupByName) {
    const rows = [];

    function processChildren(parent, depth) {
        const relevant = parent.children.filter(obj => {
            if (obj.userData._isMeasurement || obj.userData._isAnnotation || obj.userData._isCadDim3d) return false;
            if (obj.isMesh && !includeMeshes) return false;
            return obj.isMesh || obj.isGroup || obj.type === 'Object3D';
        });

        if (groupByName) {
            const seen = new Map();
            const order = [];
            relevant.forEach(obj => {
                const isGroupLike = !obj.isMesh;
                if (isGroupLike && !includeGroups) {
                    // Invisible group node – recurse without adding a row
                    processChildren(obj, depth + 1);
                    return;
                }
                const key = (obj.name || '(unnamed)') + '\0' + obj.type;
                if (seen.has(key)) {
                    seen.get(key).qty++;
                } else {
                    const entry = { name: obj.name || '(unnamed)', type: obj.type, qty: 1, depth, isGroup: isGroupLike, _ref: obj };
                    seen.set(key, entry);
                    order.push(entry);
                }
            });
            order.forEach(entry => {
                rows.push(entry);
                if (entry.isGroup) {
                    // Expand children of the first (representative) occurrence
                    processChildren(entry._ref, depth + 1);
                }
            });
        } else {
            relevant.forEach(obj => {
                const isGroupLike = !obj.isMesh;
                if (isGroupLike && !includeGroups) {
                    processChildren(obj, depth + 1);
                    return;
                }
                rows.push({ name: obj.name || '(unnamed)', type: obj.type, qty: 1, depth, isGroup: isGroupLike, _ref: obj });
                if (isGroupLike) {
                    processChildren(obj, depth + 1);
                }
            });
        }
    }

    processChildren(root, 0);
    rows.forEach((r, i) => { r.no = i + 1; });
    return rows;
}

function _downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function _makeRootRow(active, root) {
    const row = { no: 0, name: root?.name || '(unnamed)', type: 'Group', qty: 1, depth: 0, isGroup: true };
    // Return only enabled columns as string map (for CSV/TXT) — raw object used for JSON
    return row;
}

function _exportCsv(rows, root) {
    const esc = s => String(s).replace(/"/g, '""');
    const active = _bomState.exportCols.filter(c => c.enabled);
    const rootRow = _makeRootRow(active, root);
    const allRows = [rootRow, ...rows];
    const header = active.map(c => c.label.replace(/\./g, '')).join(',') + '\r\n';
    const body = allRows.map((r, i) =>
        active.map(c => {
            const val = (i > 0 && c.key === 'depth') ? r[c.key] + 1 : (r[c.key] ?? '');
            return typeof val === 'string' ? `"${esc(val)}"` : String(val);
        }).join(',')
    ).join('\r\n');
    const csvName = 'BOM_' + (root?.name || 'export').replace(/[\\/:*?"<>|]/g, '_') + '.csv';
    _downloadBlob(new Blob([header + body], { type: 'text/csv;charset=utf-8;' }), csvName);
}

function _exportJson(rows, root) {
    const active = _bomState.exportCols.filter(c => c.enabled);
    const rootRow = _makeRootRow(active, root);
    const allRows = [rootRow, ...rows];
    const out = allRows.map((r, i) => {
        const obj = {};
        active.forEach(c => {
            obj[c.key] = (i > 0 && c.key === 'depth') ? r[c.key] + 1 : (r[c.key] ?? '');
        });
        return obj;
    });
    const jsonName = 'BOM_' + (root?.name || 'export').replace(/[\\/:*?"<>|]/g, '_') + '.json';
    _downloadBlob(new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' }), jsonName);
}

function _exportTxt(rows, root) {
    const active = _bomState.exportCols.filter(c => c.enabled);

    // Build display values – shift depth by +1 so root=0, direct children=1, etc.
    const displayRows = rows.map(r => {
        const d = {};
        active.forEach(c => {
            if (c.key === 'name')       d[c.key] = '_'.repeat((r.depth + 1) * 2) + r[c.key];
            else if (c.key === 'depth') d[c.key] = String(r.depth + 1);
            else                        d[c.key] = String(r[c.key]);
        });
        return d;
    });

    // Column widths (header vs data)
    const widths = {};
    active.forEach(c => { widths[c.key] = c.label.replace(/\./g, '').length; });
    displayRows.forEach(r => {
        active.forEach(c => { widths[c.key] = Math.max(widths[c.key], r[c.key].length); });
    });

    // Prepend root assembly as row No=0 at depth 0
    const rootRow = {};
    active.forEach(c => {
        if (c.key === 'no')        rootRow[c.key] = '0';
        else if (c.key === 'name')  rootRow[c.key] = root?.name || '(unnamed)';
        else if (c.key === 'type')  rootRow[c.key] = 'Group';
        else if (c.key === 'qty')   rootRow[c.key] = '1';
        else if (c.key === 'depth') rootRow[c.key] = '0';
        else                        rootRow[c.key] = '';
    });
    const allRows = [rootRow, ...displayRows];

    // Column widths (recalculate including root row)
    active.forEach(c => { widths[c.key] = Math.max(widths[c.key], rootRow[c.key].length); });

    const pad = (str, w) => str.padEnd(w);
    const header    = active.map(c => pad(c.label.replace(/\./g, ''), widths[c.key])).join('  ');
    const separator = active.map(c => '-'.repeat(widths[c.key])).join('  ');
    const body      = allRows.map(r => active.map(c => pad(r[c.key], widths[c.key])).join('  '));

    const lines = [header, separator, ...body].join('\r\n');
    const txtName = 'BOM_' + (root?.name || 'export').replace(/[\\/:*?"<>|]/g, '_') + '.txt';
    _downloadBlob(new Blob([lines], { type: 'text/plain;charset=utf-8;' }), txtName);
}

function _buildTable(rows) {
    const tbody = document.querySelector('#bom-table tbody');
    tbody.innerHTML = '';
    rows.forEach(r => {
        const tr = document.createElement('tr');
        if (r.isGroup) tr.classList.add('bom-group-row');

        const tdNo   = document.createElement('td');
        const tdName = document.createElement('td');
        const tdType = document.createElement('td');
        const tdQty  = document.createElement('td');

        tdNo.textContent = r.no;
        tdName.style.paddingLeft = (10 + r.depth * INDENT_PX) + 'px';
        tdName.textContent = r.name;
        tdType.textContent = r.type;
        tdQty.textContent  = r.qty;

        tr.appendChild(tdNo);
        tr.appendChild(tdName);
        tr.appendChild(tdType);
        tr.appendChild(tdQty);
        tbody.appendChild(tr);
    });

    const countEl = document.getElementById('bom-row-count');
    if (countEl) countEl.textContent = `${rows.length} row${rows.length !== 1 ? 's' : ''}`;
}

function _refreshBom(root) {
    const rows = _buildTreeRows(root, _bomState.includeGroups, _bomState.includeMeshes, _bomState.groupByName);
    _buildTable(rows);
    return rows;
}

function _renderExportCols(dlg) {
    const list = dlg.querySelector('#bom-export-cols-list');
    list.innerHTML = '';
    _bomState.exportCols.forEach((col, i) => {
        const item = document.createElement('div');
        item.className = 'bom-col-item';

        const btnUp = document.createElement('button');
        btnUp.className = 'bom-col-btn';
        btnUp.textContent = '↑';
        btnUp.disabled = (i === 0);
        btnUp.addEventListener('click', () => {
            [_bomState.exportCols[i - 1], _bomState.exportCols[i]] = [_bomState.exportCols[i], _bomState.exportCols[i - 1]];
            _renderExportCols(dlg);
        });

        const btnDown = document.createElement('button');
        btnDown.className = 'bom-col-btn';
        btnDown.textContent = '↓';
        btnDown.disabled = (i === _bomState.exportCols.length - 1);
        btnDown.addEventListener('click', () => {
            [_bomState.exportCols[i], _bomState.exportCols[i + 1]] = [_bomState.exportCols[i + 1], _bomState.exportCols[i]];
            _renderExportCols(dlg);
        });

        const lbl = document.createElement('label');
        lbl.className = 'bom-col-label';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = col.enabled;
        cb.addEventListener('change', e => { col.enabled = e.target.checked; });
        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode(' ' + col.label));

        item.appendChild(btnUp);
        item.appendChild(btnDown);
        item.appendChild(lbl);
        list.appendChild(item);
    });
}

function _createDialog() {
    const dlg = document.createElement('dialog');
    dlg.id = 'bom-dialog';
    dlg.innerHTML = `
        <div class="bom-header">
            <h2>BOM</h2>
            <span id="bom-row-count" class="bom-row-count"></span>
        </div>
        <p id="bom-root-name"></p>
        <div class="bom-options">
            <label><input type="checkbox" id="bom-group-by-name" checked> Group by name (qty)</label>
            <label><input type="checkbox" id="bom-include-groups" checked> Include groups (Group / Object3D)</label>
            <label><input type="checkbox" id="bom-include-meshes"> Include meshes</label>
        </div>
        <div class="bom-export-cols-wrap">
            <span class="bom-options-label">Export columns:</span>
            <div id="bom-export-cols-list"></div>
        </div>
        <div class="bom-table-wrap">
            <table id="bom-table">
                <thead>
                    <tr><th>No.</th><th>Name</th><th>Type</th><th>Qty</th></tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
        <div class="bom-footer">
            <button id="bom-export-csv">Export CSV</button>
            <button id="bom-export-json">Export JSON</button>
            <button id="bom-export-txt">Export TXT</button>
            <span class="bom-footer-spacer"></span>
            <button id="bom-close">Close</button>
        </div>
    `;
    document.body.appendChild(dlg);

    // Close on backdrop click
    dlg.addEventListener('click', e => {
        const rect = dlg.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right ||
            e.clientY < rect.top  || e.clientY > rect.bottom) {
            dlg.close();
        }
    });

    document.getElementById('bom-close').addEventListener('click', () => dlg.close());

    document.getElementById('bom-group-by-name').addEventListener('change', e => {
        _bomState.groupByName = e.target.checked;
        _refreshBom(dlg._bomRoot);
    });

    document.getElementById('bom-include-groups').addEventListener('change', e => {
        _bomState.includeGroups = e.target.checked;
        _refreshBom(dlg._bomRoot);
    });

    document.getElementById('bom-include-meshes').addEventListener('change', e => {
        _bomState.includeMeshes = e.target.checked;
        _refreshBom(dlg._bomRoot);
    });

    _renderExportCols(dlg);

    document.getElementById('bom-export-csv').addEventListener('click', () => {
        _exportCsv(_buildTreeRows(dlg._bomRoot, _bomState.includeGroups, _bomState.includeMeshes, _bomState.groupByName), dlg._bomRoot);
    });

    document.getElementById('bom-export-json').addEventListener('click', () => {
        _exportJson(_buildTreeRows(dlg._bomRoot, _bomState.includeGroups, _bomState.includeMeshes, _bomState.groupByName), dlg._bomRoot);
    });

    document.getElementById('bom-export-txt').addEventListener('click', () => {
        _exportTxt(_buildTreeRows(dlg._bomRoot, _bomState.includeGroups, _bomState.includeMeshes, _bomState.groupByName), dlg._bomRoot);
    });

    return dlg;
}

export function openBomDialog(selectedObject) {
    if (!selectedObject) {
        alert('No object selected. Please select an assembly or part first.');
        return;
    }

    let dlg = document.getElementById('bom-dialog');
    if (!dlg) {
        dlg = _createDialog();
    }

    // Sync checkboxes with current state
    document.getElementById('bom-group-by-name').checked  = _bomState.groupByName;
    document.getElementById('bom-include-groups').checked = _bomState.includeGroups;
    document.getElementById('bom-include-meshes').checked = _bomState.includeMeshes;
    _renderExportCols(dlg);

    dlg._bomRoot = selectedObject;
    document.getElementById('bom-root-name').textContent =
        `Assembly: ${selectedObject.name || '(unnamed)'}`;

    _refreshBom(selectedObject);
    dlg.showModal();
}

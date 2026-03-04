
// --- State ---
let selectedFile = null;
let parsedIsles = {}; // { name: number[] }
let selectedNames = new Set();
let currentLang = document.documentElement.dataset.lang || 'en';


// --- i18n ---
const translations = {
    en: {
        heroTitle: "Turn uploads into structured output.",
        heroSub: "Upload a document and run processing to produce consistent results for internal use.",
        upload: "Upload",
        process: "Process",
        uploadFile: "Upload a file",
        dropText: "Drag & drop here, or click to select.",
        noFile: "No file selected",
        chooseFile: "Choose a file to enable processing.",
        otherWorks: "Other works",
        otherWorksDesc: "Explore related tools and experiments built around workflow automation and scraping.",
        otherWorksChip: "References",
        workStatus: "Prototype",
        workCta: "View details",
        work1Title: "Receipt Parser",
        work1Desc: "Extracts structured line-items and totals from raw receipts for downstream matching.",
        work2Title: "Label Generator",
        work2Desc: "Generates consistent labels from templates with sane defaults and quick export.",
        work3Title: "MOMO Data Helper",
        work3Desc: "Scrapes and normalizes isle lists and selections from MOMO via the browser extension.",
        tagParsing: "Parsing",
        tagTemplates: "Templates",
        tagExport: "Export",
        tagExtension: "Extension",
        tagAutomation: "Automation",
        helpBtnTop: "Help",
        tagline: "Internal tooling",
        footerNote: "Designed for internal operations",
        selectionTitle: "Selection",
        selectionChip: "Aisles",
        selectionHint: "Paste input, parse it, then select any number of entries.",
        selectionPasteLabel: "Paste input",
        manualHint: "Or add an aile manually.",
        manualNameLabel: "Name",
        manualIntsLabel: "Integers",
        manualAdd: "Add",
        manualTip: "Tip: use commas, spaces, or [brackets].",
        manualErrName: "Please enter a name.",
        manualErrInts: "Please enter at least one integer.",
        manualOk: "Saved.",
        includeMissing: "Include missing Assortiment groups",
        parse: "Parse",
        selectAll: "Select all",
        clear: "Clear"
    },
    nl: {
        heroTitle: "Zet uploads om in gestructureerde output.",
        heroSub: "Upload een document en voer de verwerking uit voor consistente resultaten voor intern gebruik.",
        upload: "Uploaden",
        process: "Verwerken",
        uploadFile: "Bestand uploaden",
        dropText: "Sleep hierheen of klik om te selecteren.",
        noFile: "Geen bestand geselecteerd",
        chooseFile: "Kies een bestand om verwerking mogelijk te maken.",
        otherWorks: "Andere projecten",
        otherWorksDesc: "Bekijk gerelateerde tools en experimenten rond workflow-automatisering en scraping.",
        otherWorksChip: "Referenties",
        workStatus: "Prototype",
        workCta: "Bekijk details",
        work1Title: "Bonnen parser",
        work1Desc: "Haalt gestructureerde regels en totalen uit bonnen voor verdere koppeling.",
        work2Title: "Label generator",
        work2Desc: "Maakt consistente labels vanuit templates met snelle export.",
        work3Title: "MOMO data helper",
        work3Desc: "Scrapet en normaliseert gangenlijsten en selecties uit MOMO via de browserextensie.",
        tagParsing: "Parseren",
        tagTemplates: "Templates",
        tagExport: "Export",
        tagExtension: "Extensie",
        tagAutomation: "Automatisering",
        helpBtnTop: "Help",
        tagline: "Interne tooling",
        footerNote: "Ontworpen voor interne processen",
        selectionTitle: "Selectie",
        selectionChip: "Paden",
        selectionHint: "Plak de invoer, lees het in en selecteer daarna één of meerdere items.",
        selectionPasteLabel: "Plak invoer",
        manualHint: "Of voeg handmatig een aile toe.",
        manualNameLabel: "Naam",
        manualIntsLabel: "Getallen",
        manualAdd: "Opslaan",
        manualTip: "Tip: gebruik komma's, spaties of [haakjes].",
        manualErrName: "Vul een naam in.",
        manualErrInts: "Vul minstens één getal in.",
        manualOk: "Opgeslagen.",
        includeMissing: "Ontbrekende assortimentsgroepen meenemen",
        parse: "Inlezen",
        selectAll: "Alles selecteren",
        clear: "Wissen"
    }
};

function i18n(key, fallback) {
    const lang = document.documentElement.dataset.lang || 'en';
    return (translations[lang] && translations[lang][key]) ? translations[lang][key] : fallback;
}

function setLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
    currentLang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n;
        if (translations[lang] && translations[lang][key]) el.textContent = translations[lang][key];
    });

    langToggle.textContent = lang === 'en' ? 'NL' : 'EN';
    // refresh JS-driven text
    setFile(selectedFile);
    updateSelectionUIState();
}

// --- Upload ---
function setFile(file) {
    selectedFile = file;
    if (!file) {
        fileName.textContent = i18n('noFile', 'No file selected');
        fileHint.textContent = i18n('chooseFile', 'Choose a file to enable processing.');
        processBtn.disabled = true;
        processBtn.classList.remove('btn-primary');
        return;
    }

    fileName.textContent = file.name;
    fileHint.textContent = String(Math.round(file.size / 1024)) + ' KB • ' + (file.type || 'unknown type');
    processBtn.disabled = false;
    processBtn.classList.add('btn-primary');
}


document.addEventListener("DOMContentLoaded", async (e) => {
    // --- Elements ---
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const processBtn = document.getElementById('processBtn');
    const dropZone = document.getElementById('dropZone');

    const fileName = document.getElementById('fileName');
    const fileHint = document.getElementById('fileHint');

    // Selection UI
    const isleInput = document.getElementById('isleInput');
    const parseIslesBtn = document.getElementById('parseIslesBtn');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const clearSelBtn = document.getElementById('clearSelBtn');
    const parseStatus = document.getElementById('parseStatus');
    const optionsList = document.getElementById('optionsList');
    const selCount = document.getElementById('selCount');

    // Manual add UI
    const manualName = document.getElementById('manualName');
    const manualInts = document.getElementById('manualInts');
    const addManualBtn = document.getElementById('addManualBtn');
    const includeMissing = document.getElementById('includeMissing');

    const helpTop = document.getElementById('helpTop');
    const langToggle = document.getElementById('langToggle');



    uploadBtn.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        setFile(file || null);
    });

    ['dragenter', 'dragover'].forEach((evt) => {
        dropZone.addEventListener(evt, (e) => {
            e.preventDefault();
            dropZone.style.background = 'rgba(255,255,255,.06)';
            dropZone.style.borderColor = 'rgba(59,130,246,.65)';
        });
    });

    ['dragleave', 'drop'].forEach((evt) => {
        dropZone.addEventListener(evt, (e) => {
            e.preventDefault();
            dropZone.style.background = '';
            dropZone.style.borderColor = '';
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) setFile(file);
    });

    processBtn.addEventListener('click', () => {
        processESL();
    });

    parseIslesBtn.addEventListener('click', parseIsleInput);

    selectAllBtn.addEventListener('click', () => {
        selectedNames = new Set(Object.keys(parsedIsles));
        optionsList.querySelectorAll('input[type="checkbox"]').forEach((cb) => { cb.checked = true; });
        updateSelectionUIState();
    });

    clearSelBtn.addEventListener('click', () => {
        selectedNames = new Set();
        optionsList.querySelectorAll('input[type="checkbox"]').forEach((cb) => { cb.checked = false; });
        updateSelectionUIState();
    });


    addManualBtn.addEventListener('click', manualAdd);

    // Enter-to-add support from either field
    ;[manualName, manualInts].forEach((el) => {
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                manualAdd();
            }
        });
    });

    // Top buttons
    langToggle.addEventListener('click', () => {
        setLanguage(currentLang === 'en' ? 'nl' : 'en');
    });

    helpTop.addEventListener('click', () => {
        // No clipboard usage in this build.
        alert('Help: upload a file and paste aile input to filter.');
    });

    // Footer year
    document.getElementById('year').textContent = String(new Date().getFullYear());

    // Init
    setLanguage(currentLang);
    setFile(null);
    updateSelectionUIState();

});

// --- Selection parsing & rendering ---
function setStatus(msg, kind) {
    parseStatus.textContent = msg || '';
    parseStatus.classList.remove('ok', 'err');
    if (kind) parseStatus.classList.add(kind);
}

function updateSelectionUIState() {
    const hasOptions = Object.keys(parsedIsles).length > 0;
    selectAllBtn.disabled = !hasOptions;
    clearSelBtn.disabled = !hasOptions;

    const count = selectedNames.size;
    const suffix = (document.documentElement.dataset.lang || 'en') === 'nl' ? 'geselecteerd' : 'selected';
    selCount.textContent = String(count) + ' ' + suffix;
}

function extractObjectBlock(text) {
    const s = (text || '').trim();
    if (!s) return '';
    const start = s.indexOf('{');
    const end = s.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return '';
    return s.slice(start, end + 1);
}

function quoteKeysLoosely(objText) {
    // Best-effort conversion: {Baby + Haar: [1]} -> {"Baby + Haar": [1]}
    let out = '';
    let i = 0;
    let inString = false;
    let quoteChar = '"';
    let expectingKey = false;

    const isWs = (c) => c === ' ' || c === '\n' || c === '\t' || c === '\r';

    while (i < objText.length) {
        const c = objText[i];

        if (inString) {
            if (c === quoteChar) {
                out += '"';
                inString = false;
            } else {
                out += c;
            }
            i += 1;
            continue;
        }

        if (c === '"' || c === "'") {
            inString = true;
            quoteChar = c;
            out += '"';
            i += 1;
            continue;
        }

        if (c === '{' || c === ',') {
            out += c;
            expectingKey = true;
            i += 1;
            continue;
        }

        if (expectingKey) {
            while (i < objText.length && isWs(objText[i])) {
                out += objText[i];
                i += 1;
            }
            if (i >= objText.length) break;

            if (objText[i] === '"') {
                // already quoted key
                out += '"';
                i += 1;
                while (i < objText.length) {
                    const c2 = objText[i];
                    out += c2;
                    i += 1;
                    if (c2 === '"') break;
                }
                expectingKey = false;
                continue;
            }

            let key = '';
            while (i < objText.length && objText[i] !== ':') {
                key += objText[i];
                i += 1;
            }

            out += '"' + key.trim() + '"';
            if (i < objText.length && objText[i] === ':') {
                out += ':';
                i += 1;
            }

            expectingKey = false;
            continue;
        }

        out += c;
        i += 1;
    }

    return out;
}

function parseInputToObject(raw) {
    const block = extractObjectBlock(raw);
    if (!block) return null;
    try {
        return JSON.parse(block);
    } catch {
        return JSON.parse(quoteKeysLoosely(block));
    }
}

function parseIntList(raw) {
    // Accept: "1,2,3" | "1 2 3" | "[1, 2, 3]" | "1;2;3" | multi-line
    const s0 = String(raw || '').trim();
    if (!s0) return [];

    let s = s0;
    if (s[0] === '[' && s[s.length - 1] === ']') s = s.slice(1, -1);

    const nums = [];
    let cur = '';

    const pushCur = () => {
        const t = cur.trim();
        if (!t) return;
        const n = Number(t);
        if (Number.isFinite(n)) nums.push(n);
    };

    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        const isDelim = ch === ',' || ch === ';' || ch === ' ' || ch === '\n' || ch === '\t' || ch === '\r';
        if (isDelim) {
            pushCur();
            cur = '';
        } else {
            cur += ch;
        }
    }
    pushCur();
    return nums;
}

function renderOptions() {
    const entries = Object.entries(parsedIsles).sort((a, b) => a[0].localeCompare(b[0]));
    optionsList.innerHTML = '';

    for (let i = 0; i < entries.length; i++) {
        const name = entries[i][0];
        const ints = entries[i][1];

        const row = document.createElement('label');
        row.className = 'opt';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = selectedNames.has(name);
        cb.addEventListener('change', () => {
            if (cb.checked) selectedNames.add(name);
            else selectedNames.delete(name);
            updateSelectionUIState();
        });

        const main = document.createElement('div');
        main.className = 'opt-main';

        const title = document.createElement('div');
        title.className = 'opt-name';
        title.textContent = name;

        const meta = document.createElement('div');
        meta.className = 'opt-meta';
        meta.textContent = JSON.stringify(ints || []);

        main.appendChild(title);
        main.appendChild(meta);

        row.appendChild(cb);
        row.appendChild(main);
        optionsList.appendChild(row);
    }
}

function parseIsleInput() {
    try {
        const obj = parseInputToObject(isleInput.value);
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Expected object');

        const cleaned = {};
        Object.keys(obj).forEach((k) => {
            const arr = Array.isArray(obj[k]) ? obj[k] : [];
            cleaned[String(k)] = arr.map((n) => Number(n)).filter((n) => Number.isFinite(n));
        });

        parsedIsles = cleaned;
        selectedNames = new Set();
        renderOptions();
        setStatus('Loaded ' + String(Object.keys(parsedIsles).length) + ' entries.', 'ok');
        updateSelectionUIState();
    } catch {
        parsedIsles = {};
        selectedNames = new Set();
        optionsList.innerHTML = '';
        setStatus('Could not parse input. Try a JSON object like {"Name": [1,2]}.', 'err');
        updateSelectionUIState();
    }
}

// Manual add: overwrite existing by name (as requested)
function addManualEntry(nameRaw, intsRaw) {
    const name = String(nameRaw || '').trim();
    const ints = parseIntList(intsRaw);

    if (!name) {
        setStatus(i18n('manualErrName', 'Please enter a name.'), 'err');
        return { ok: false, reason: 'name' };
    }
    if (ints.length === 0) {
        setStatus(i18n('manualErrInts', 'Please enter at least one integer.'), 'err');
        return { ok: false, reason: 'ints' };
    }

    parsedIsles[name] = ints; // overwrite
    selectedNames.add(name);

    renderOptions();
    setStatus(i18n('manualOk', 'Saved.'), 'ok');
    updateSelectionUIState();

    return { ok: true, name, ints };
}

function manualAdd() {
    const res = addManualEntry(manualName.value, manualInts.value);
    if (res.ok) {
        // After entering, empty BOTH fields (requested)
        manualName.value = '';
        manualInts.value = '';
        manualName.focus();
    }
}



// --- Processing ---
/**
 * Builds a map of selected aile names -> integer lists.
 * Only includes currently selected names.
 */
function buildSelectedAileMap() {
    const out = new Map();
    selectedNames.forEach((name) => {
        if (Object.prototype.hasOwnProperty.call(parsedIsles, name)) {
            out[name] = parsedIsles[name];
        }
    });
    return out;
}

/**
 * Boolean option: when true, backend may include Assortiment groups that are present in the PDF
 * but not in the selected aile map.
 */
function getIncludeMissingAssortimentGroups() {
    return !!(includeMissing && includeMissing.checked);
}

/**
 * Sends the uploaded PDF + selected aile map to the backend.
 * Uses multipart/form-data:
 * - file: the PDF
 * - ailes: JSON string of { "Name": [ints] }
 * - includeMissingAssortimentGroups: "true" | "false"
 */
async function processESL() {
    try {
        if (!selectedFile) {
            alert('Please upload a PDF first.');
            return;
        }

        const isPdf = (selectedFile.type === 'application/pdf') || String(selectedFile.name || '').toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            alert('Please upload a PDF file (.pdf).');
            return;
        }
        const ailes = buildSelectedAileMap(); // can be empty
        console.log(ailes);
        if (!getIncludeMissingAssortimentGroups() && ailes.size == 0) {
            alert("Please enable missing aisles and/or select aisles to include")
            return;
        }
        const form = new FormData();
        form.append('file', selectedFile, selectedFile.name);
        form.append('ailes', JSON.stringify(ailes));
        form.append('addMissing', getIncludeMissingAssortimentGroups() ? 'true' : 'false');
        // Default endpoint. Change as needed.
        const endpoint = '../api/process';

        processBtn.disabled = true;
        processBtn.classList.add('btn-primary');

        const res = await fetch(endpoint, {
            method: 'POST',
            body: form,
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error('Backend error ' + res.status + (text ? (': ' + text) : ''));
        }

        const contentType = res.headers.get('content-type') || '';
        let payload;
        if (contentType.includes('application/json')) {
            payload = await res.json();
        } else {
            payload = await res.text();
        }

        console.log('[process] response:', payload);
        openResultWindow(payload);
    } catch (e) {
        alert('Processing failed: ' + (e && e.message ? e.message : String(e)));
    } finally {
        processBtn.disabled = !selectedFile;
        if (selectedFile) {
            processBtn.classList.add('btn-primary');
        } else {
            processBtn.classList.remove('btn-primary');
        }
    }

    function openResultWindow(result) {
        const newWindow = window.open("/results", "_blank");
        newWindow.onload = () => {
            newWindow.postMessage(result, window.location.origin);
        };

        const timer = setInterval(() => {
            if (newWindow.closed) {
                clearInterval(timer);
                console.log("CLOSED");
                fetch("/delete/" + result.folderID, { method: "DELETE" });
            }
        }, 500);
    }
}
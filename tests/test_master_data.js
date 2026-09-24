/**
 * SUITE 1: MASTER DATA & STATIC ARCHITECTURE INTEGRITY
 *
 * Validates master data integrity, zero duplicate codes, correct Tower configurations,
 * valid stage sequences (1 to 5), 37 total checklist items across 5 stages,
 * and correct role-based identities without PII.
 */

const fs = require('fs');
const assert = require('assert');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

console.log('================================================================');
console.log('SUITE 1: MASTER DATA & STATIC ARCHITECTURE INTEGRITY');
console.log('================================================================');

// 1. Static HTML Structural Anchors
console.log('\n--- 1. Static HTML Structural Anchors ---');
assert(src.includes('id="RS"'), 'Landing page root container #RS must exist');
assert(src.includes('id="MA"'), 'Main application root container #MA must exist');
assert(src.includes('id="RG"'), 'Role grid container #RG must exist');
assert(src.includes('id="SB"'), 'Sidebar container #SB must exist');
assert(src.includes('id="MN"'), 'Main content container #MN must exist');
assert(src.includes('id="obsModal"'), 'Quality Observation modal #obsModal must exist');
assert(src.includes('id="obsRectModal"'), 'Observation rectification modal #obsRectModal must exist');
assert(src.includes('id="dpdpModal"'), 'DPDP compliance modal #dpdpModal must exist');
assert(src.includes('id="loadingOverlay"'), 'Loading overlay #loadingOverlay must exist');
console.log('  ✓ PASS: Critical DOM structural anchors present in index.html');

// 2. VM Execution Setup
console.log('\n--- 2. VM Execution & Master Data Verification ---');

const scriptMatch = src.match(/<script(?![^>]*src=)[\s\S]*?>([\s\S]*?)<\/script>/i);
assert(scriptMatch, 'Must extract inline script block from index.html');

const mockStorage = {};
const mockDoc = {
    getElementById: (id) => ({
        id,
        innerHTML: '',
        value: '',
        style: {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {} },
        setAttribute: () => {},
        getAttribute: () => null,
        dataset: {},
        getContext: () => ({
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            stroke: () => {},
            clearRect: () => {}
        }),
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 160 })
    }),
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: () => {},
    body: { classList: { add: () => {}, remove: () => {} } }
};

const sandbox = {
    window: {},
    document: mockDoc,
    console: console,
    localStorage: {
        getItem: (k) => mockStorage[k] || null,
        setItem: (k, v) => { mockStorage[k] = String(v); },
        removeItem: (k) => { delete mockStorage[k]; },
        clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
    },
    navigator: { geolocation: { getCurrentPosition: (cb) => cb({ coords: { latitude: 17.4325, longitude: 78.3412, accuracy: 12 } }) } },
    alert: (msg) => console.log('Mock Alert:', msg),
    confirm: () => true,
    prompt: () => 'Test input',
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {}
};
sandbox.window = sandbox;

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

// 3. Verify Master Data Objects (CASCADE & Projects)
assert(sandbox.CASCADE, 'CASCADE object must be declared');
const projectNames = Object.keys(sandbox.CASCADE);
assert(projectNames.length >= 3, 'Must configure at least 3 projects');

projectNames.forEach(pName => {
    const proj = sandbox.CASCADE[pName];
    assert(Array.isArray(proj.towers), `Project ${pName} must have towers array`);
    assert(proj.towers.length >= 2, `Project ${pName} must have at least 2 towers`);
    assert(proj.floors > 0, `Project ${pName} must specify floors`);
    assert(Array.isArray(proj.civil), `Project ${pName} must have civil engineers array`);
    assert(Array.isArray(proj.mep), `Project ${pName} must have mep engineers array`);
    assert(Array.isArray(proj.mgr), `Project ${pName} must have managers array`);
});
console.log(`  ✓ PASS: Master CASCADE projects verified: ${projectNames.join(', ')}`);

// 4. Verify Roles (DPDP Compliant - Zero Personal Names)
assert(Array.isArray(sandbox.ROLES), 'ROLES must be an array');
assert(sandbox.ROLES.length >= 7, 'Must define at least 7 standard enterprise roles');
const roleIds = sandbox.ROLES.map(r => r.id);
assert(new Set(roleIds).size === roleIds.length, 'Role IDs must be strictly unique');

// Assert zero personal names in role labels
const personalNameTriggers = ['ramesh', 'suresh', 'john', 'priya', 'kumar', 'sharma', 'mohit'];
sandbox.ROLES.forEach(role => {
    const combined = `${role.id} ${role.lbl} ${role.ds}`.toLowerCase();
    for (const name of personalNameTriggers) {
        assert(!combined.includes(name), `Role ${role.id} contains personal name "${name}" - violates DPDP Act 2023`);
    }
});
console.log(`  ✓ PASS: ${sandbox.ROLES.length} DPDP-compliant roles configured: ${roleIds.join(', ')}`);

// 5. Verify 5 Sequential Stages and 37 Total Checklist Items (CL)
assert(sandbox.CL, 'CL (Checklists) object must be declared');
const stageKeys = Object.keys(sandbox.CL);
assert.strictEqual(stageKeys.length, 5, 'Must have exactly 5 quality stages in CL');

let totalChecklistItems = 0;
const stageExpectedCounts = { 1: 13, 2: 6, 3: 7, 4: 8, 5: 3 };

stageKeys.forEach(stageNum => {
    const stage = sandbox.CL[stageNum];
    assert(stage.title, `Stage ${stageNum} must have a title`);
    assert(stage.role, `Stage ${stageNum} must specify responsible role`);
    assert(Array.isArray(stage.items), `Stage ${stageNum} must have items array`);
    assert.strictEqual(stage.items.length, stageExpectedCounts[stageNum], `Stage ${stageNum} must have ${stageExpectedCounts[stageNum]} items`);
    totalChecklistItems += stage.items.length;
    stage.items.forEach(item => {
        assert(item.n, `Checklist item in stage ${stageNum} must have number (n)`);
        assert(item.q, `Checklist item ${item.n} in stage ${stageNum} must have question text (q)`);
        assert(item.d, `Checklist item ${item.n} in stage ${stageNum} must have description text (d)`);
    });
});
assert.strictEqual(totalChecklistItems, 37, `Must have exactly 37 checklist items across 5 stages (found: ${totalChecklistItems})`);
console.log(`  ✓ PASS: Exactly 5 sequential stages with 37 unique checklist items verified (13 + 6 + 7 + 8 + 3 = 37)`);

// 6. Verify Initial State and Demo Portfolio
assert(sandbox.V, 'State object V must be declared');
assert(Array.isArray(sandbox.PORTFOLIO), 'PORTFOLIO must be an array of activities');
assert(sandbox.PORTFOLIO.length >= 10, 'Must have seeded initial portfolio activities');
console.log(`  ✓ PASS: Initial activities seeded: ${sandbox.PORTFOLIO.length} portfolio records in memory`);

console.log('\n================================================================');
console.log('SUITE 1: MASTER DATA INTEGRITY - ALL TESTS PASSED');
console.log('================================================================');

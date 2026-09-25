/**
 * SUITE 15: 3-TIER FREEZING SCOPE HIERARCHY & CROSS-SIDE MUTUAL EXCLUSIVITY LOCKS
 *
 * Verifies:
 * 1. 3-Tier Freezing Scope Architecture:
 *    - SWN: Entire Tower Freeze (towerFrozen = true)
 *    - NCR: Floor Worksite Freeze (floorFrozen = true)
 *    - OBS: Flat Worksite Freeze (flatFrozen = true)
 * 2. Concurrency Locking & Mutual Exclusivity:
 *    - When Tower is frozen by active SWN, duplicate SWN issuance is locked.
 *    - When Floor is frozen by active NCR, duplicate NCR issuance is locked.
 *    - When Flat is frozen by active Observation, duplicate Observation is locked.
 * 3. showActiveFreezeAlert displays standard lock warning toast and blocks duplicate modal opens.
 * 4. Multi-hold independence: Holds at different scopes resolve independently; activity only
 *    unfreezes when ALL active holds are lifted.
 */

const fs = require('fs');
const assert = require('assert');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

console.log('================================================================');
console.log('SUITE 15: 3-TIER FREEZE SCOPES & MUTUAL EXCLUSIVITY LOCKS');
console.log('================================================================');

const scriptMatch = src.match(/<script(?![^>]*src=)[\s\S]*?>([\s\S]*?)<\/script>/i);
assert(scriptMatch, 'Must extract inline script block from index.html');

let lastToast = null;
const mockStorage = {};
const mockDoc = {
    getElementById: (id) => ({
        id, innerHTML: '', value: '', checked: true, style: {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {} },
        setAttribute: () => {}, getAttribute: () => null, dataset: {}, appendChild: () => {}
    }),
    createElement: (tag) => ({
        tagName: (tag || 'div').toUpperCase(),
        id: '', innerHTML: '', className: '', style: {},
        appendChild: () => {}, remove: () => {}, classList: { add: () => {}, remove: () => {} }
    }),
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: () => {},
    body: { classList: { add: () => {}, remove: () => {} }, appendChild: () => {} }
};

const sandbox = {
    window: {},
    document: mockDoc,
    console: console,
    localStorage: {
        getItem: (k) => mockStorage[k] || null,
        setItem: (k, v) => { mockStorage[k] = String(v); },
        removeItem: (k) => { delete mockStorage[k]; },
        clear: () => {}
    },
    navigator: { geolocation: { getCurrentPosition: () => {} } },
    alert: () => {},
    confirm: () => true,
    prompt: () => 'Test Concurrency',
    toast: (msg, type) => { lastToast = { msg, type }; },
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {}
};
sandbox.window = sandbox;

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

// Hook toast function to capture alerts
sandbox.toast = (msg, type) => { lastToast = { msg, type }; };

// 1. Initial Unfrozen Baseline
console.log('\n--- 1. Initial Baseline (Zero Active Holds) ---');
assert(sandbox.V.act, 'V.act must exist');
sandbox.V.act.towerFrozen = false;
sandbox.V.act.floorFrozen = false;
sandbox.V.act.flatFrozen = false;
sandbox.V.act.swns = [];
sandbox.V.act.ncrs = [];
sandbox.V.act.observations = [];
sandbox.updateFreezeState();

assert.strictEqual(sandbox.V.act.towerFrozen, false, 'Tower must not be frozen');
assert.strictEqual(sandbox.V.act.floorFrozen, false, 'Floor must not be frozen');
assert.strictEqual(sandbox.V.act.flatFrozen, false, 'Flat must not be frozen');
assert.strictEqual(sandbox.V.act.frozen, false, 'Composite frozen state must be false');
console.log('  ✓ PASS: Initial baseline verified (0 holds active)');

// 2. Scope 1: Stop Work Notification (SWN) - Entire Tower Freeze & Lock
console.log('\n--- 2. Scope 1: SWN Entire Tower Freeze & Duplicate Lock ---');
sandbox.V.role = 'qh';
sandbox.doRaiseSWN('Tower-wide concrete strength deficit.');

assert.strictEqual(sandbox.V.act.towerFrozen, true, 'Tower must be frozen');
assert.strictEqual(sandbox.V.act.floorFrozen, false, 'Floor must not be independently frozen by SWN');
assert.strictEqual(sandbox.V.act.flatFrozen, false, 'Flat must not be independently frozen by SWN');
assert.strictEqual(sandbox.V.act.frozen, true, 'Activity must be composite frozen');

// Attempt duplicate SWN trigger
lastToast = null;
sandbox.openRaiseSWNModal();
assert(lastToast, 'showActiveFreezeAlert must be invoked when opening SWN modal while tower is already frozen');
assert(lastToast.msg.includes('Tower Frozen'), 'Lock alert must indicate Tower Frozen with active SWN');
assert.strictEqual(lastToast.type, 'warning');
console.log(`  ✓ PASS: Tower frozen by SWN. Duplicate attempt locked: "${lastToast.msg}"`);

// 3. Scope 2: Non-Conformance Report (NCR) - Floor Worksite Freeze & Lock
console.log('\n--- 3. Scope 2: NCR Floor Worksite Freeze & Duplicate Lock ---');
sandbox.V.role = 'qc';
sandbox.doSubmitRapidNCR();

assert.strictEqual(sandbox.V.act.floorFrozen, true, 'Floor must now be frozen by NCR');
assert.strictEqual(sandbox.V.act.towerFrozen, true, 'Tower remains frozen from previous hold');

// Attempt duplicate NCR trigger
lastToast = null;
sandbox.openRaiseNCRModal();
assert(lastToast, 'showActiveFreezeAlert must be invoked when opening NCR modal while floor is already frozen');
assert(lastToast.msg.includes('Floor Frozen'), 'Lock alert must indicate Floor Frozen with active NCR');
assert.strictEqual(lastToast.type, 'warning');
console.log(`  ✓ PASS: Floor frozen by NCR. Duplicate attempt locked: "${lastToast.msg}"`);

// 4. Scope 3: Quality Observation (OBS) - Flat Worksite Freeze & Lock
console.log('\n--- 4. Scope 3: OBS Flat Worksite Freeze & Duplicate Lock ---');
sandbox.doSubmitObs();

assert.strictEqual(sandbox.V.act.flatFrozen, true, 'Flat must now be frozen by OBS');

// Attempt duplicate OBS trigger
lastToast = null;
sandbox.openObsModal();
assert(lastToast, 'showActiveFreezeAlert must be invoked when opening OBS modal while flat is already frozen');
assert(lastToast.msg.includes('Flat Frozen'), 'Lock alert must indicate Flat Frozen with active OBS');
assert.strictEqual(lastToast.type, 'warning');
console.log(`  ✓ PASS: Flat frozen by OBS. Duplicate attempt locked: "${lastToast.msg}"`);

// 5. Verification of Multi-Tier Concurrency Buttons in UI
console.log('\n--- 5. Defect Governance Bar Concurrency UI State ---');
const govBarHtml = sandbox.renderDefectGovBar();
assert(govBarHtml.includes('Tower Frozen'), 'SWN button must reflect locked Tower Frozen state');
assert(govBarHtml.includes('Floor Frozen'), 'NCR button must reflect locked Floor Frozen state');
assert(govBarHtml.includes('Flat Frozen'), 'OBS button must reflect locked Flat Frozen state');
assert(govBarHtml.includes('btn-disabled'), 'Buttons must have btn-disabled styling when locked');
console.log('  ✓ PASS: All 3 tiers show synchronized lock indicators in Defect Governance Bar');

// 6. Independent Staggered Release / Unfreeze
console.log('\n--- 6. Independent Multi-Hold Resolution ---');
// Step A: Lift Tower SWN
const swnId = sandbox.V.act.swns[0].id;
sandbox.doLiftSWN(swnId);
assert.strictEqual(sandbox.V.act.towerFrozen, false, 'Tower freeze must be released');
assert.strictEqual(sandbox.V.act.floorFrozen, true, 'Floor freeze must persist independently');
assert.strictEqual(sandbox.V.act.flatFrozen, true, 'Flat freeze must persist independently');
assert.strictEqual(sandbox.V.act.frozen, true, 'Activity must remain frozen due to pending Floor NCR and Flat OBS');
console.log('  ✓ PASS: Tower SWN lifted; Floor and Flat holds persist independently');

// Step B: Close Flat Observation
const obsId = sandbox.V.act.observations[0].id;
sandbox.doCloseObs(obsId);
assert.strictEqual(sandbox.V.act.flatFrozen, false, 'Flat freeze must be released');
assert.strictEqual(sandbox.V.act.floorFrozen, true, 'Floor freeze must persist');
assert.strictEqual(sandbox.V.act.frozen, true, 'Activity remains frozen due to pending Floor NCR');
console.log('  ✓ PASS: Flat Observation closed; Floor NCR hold persists');

// Step C: Close Floor NCR
sandbox.V.act.ncrs[0].status = 'closed';
sandbox.updateFreezeState();
assert.strictEqual(sandbox.V.act.floorFrozen, false, 'Floor freeze must be released');
assert.strictEqual(sandbox.V.act.frozen, false, 'All holds released; Activity successfully unfrozen');
console.log('  ✓ PASS: All holds cleared. Activity status fully restored.');

console.log('\n================================================================');
console.log('SUITE 15: 3-TIER FREEZE SCOPES & LOCKS - ALL TESTS PASSED');
console.log('================================================================');

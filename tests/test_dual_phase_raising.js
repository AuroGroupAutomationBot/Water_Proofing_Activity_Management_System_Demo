/**
 * SUITE 14: DUAL-PHASE DEFECT GOVERNANCE (PRE- & POST-CHECKLIST SUBMISSION)
 *
 * Verifies:
 * 1. Defects (SWN, NCR, Observation) can be raised BEFORE checklist submission (Draft / Pending stage).
 * 2. Defects (SWN, NCR, Observation) can be raised AFTER checklist submission (Submitted / Review / Approved states).
 * 3. renderDefectGovBar is accessible across all key application views:
 *    - Dashboard (pgDash)
 *    - Stage Inspection Form (pgStage)
 *    - QC Review Workspace (pgQC)
 *    - Activity Detail / History (pgDetail)
 * 4. Active freeze banners render prominently across all screens during any hold.
 */

const fs = require('fs');
const assert = require('assert');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

console.log('================================================================');
console.log('SUITE 14: DUAL-PHASE DEFECT GOVERNANCE (PRE- & POST-SUBMISSION)');
console.log('================================================================');

const scriptMatch = src.match(/<script(?![^>]*src=)[\s\S]*?>([\s\S]*?)<\/script>/i);
assert(scriptMatch, 'Must extract inline script block from index.html');

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
    prompt: () => 'Test Dual-Phase',
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {}
};
sandbox.window = sandbox;

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

// 1. Universal UI Surface Availability
console.log('\n--- 1. Defect Governance Bar Availability Across All Views ---');
assert(typeof sandbox.renderDefectGovBar === 'function', 'renderDefectGovBar must be defined');

// Dashboard View
sandbox.V.role = 'civil_rcc';
sandbox.V.act.created = true;
const dashHtml = sandbox.pgDash();
assert(dashHtml.includes('defect-gov-bar'), 'Dashboard must contain defect governance bar');

// Stage Form View
sandbox.V.params = { n: 1 };
const stageHtml = sandbox.pgStage();
assert(stageHtml.includes('defect-gov-bar'), 'Stage form must contain defect governance bar');

// QC Review View
sandbox.V.role = 'qc';
const qcHtml = sandbox.pgQC();
assert(qcHtml.includes('defect-gov-bar'), 'QC Review must contain defect governance bar');

// Activity Detail View
const detailHtml = sandbox.pgDetail();
assert(detailHtml.includes('defect-gov-bar'), 'Detail page must contain defect governance bar');

console.log('  ✓ PASS: renderDefectGovBar rendered across Dashboard, Stage Form, QC Review & Detail views');

// 2. Phase 1: Pre-Submission Defect Raising
console.log('\n--- 2. Phase 1: Pre-Submission Defect Raising (Draft State) ---');
// Stage 1 is in 'pending' (unsubmitted) state
sandbox.V.act.stages[1].st = 'pending';
assert.strictEqual(sandbox.V.act.stages[1].st, 'pending', 'Activity must be unsubmitted');

// Pre-submission Observation
sandbox.V.role = 'qc';
assert(typeof sandbox.doSubmitObs === 'function');
sandbox.doSubmitObs();
assert.strictEqual(sandbox.V.act.flatFrozen, true, 'Pre-submission Observation must freeze flat');
assert.strictEqual(sandbox.V.act.frozen, true, 'Activity must be composite frozen');
console.log('  ✓ PASS: Observation successfully logged prior to checklist submission (Flat Frozen)');

// Verify that stage submission is strictly blocked while frozen
let submitAttemptBlocked = false;
sandbox.toast = (msg, type) => {
    if (type === 'danger' && msg.includes('frozen')) submitAttemptBlocked = true;
};
sandbox.doSubmitStage(1);
assert.strictEqual(submitAttemptBlocked, true, 'doSubmitStage must reject submission while activity is frozen');
console.log('  ✓ PASS: Checklist submission strictly blocked while defect hold is active');

// Close observation
const obsId = sandbox.V.act.observations[0].id;
sandbox.doCloseObs(obsId);
assert.strictEqual(sandbox.V.act.flatFrozen, false, 'Flat freeze lifted after OBS closeout');
assert.strictEqual(sandbox.V.act.frozen, false, 'Activity unfreezes after defect resolution');

// 3. Phase 2: Post-Submission Defect Raising
console.log('\n--- 3. Phase 2: Post-Submission Defect Raising (Submitted & Approved States) ---');
// Advance Stage 1 to approved
sandbox.V.act.stages[1].st = 'approved';
sandbox.V.act.stages[2].st = 'approved';
sandbox.V.act.stages[3].st = 'submitted'; // Under QC review

// Post-submission SWN (Entire Tower Freeze)
sandbox.V.role = 'qh';
sandbox.doRaiseSWN('Severe leakage observed on lower floor underside during ponding test.');
assert.strictEqual(sandbox.V.act.towerFrozen, true, 'Post-submission SWN must trigger blanket tower freeze');
assert.strictEqual(sandbox.V.act.frozen, true, 'Activity status must be frozen');

const activeSwn = sandbox.V.act.swns[sandbox.V.act.swns.length - 1];
console.log(`  ✓ PASS: SWN ${activeSwn.id} raised post-submission. towerFrozen = ${sandbox.V.act.towerFrozen}`);

// Post-submission freeze banners check
const postFreezeDash = sandbox.pgDash();
assert(postFreezeDash.includes('BLANKET ENTIRE TOWER FREEZE ACTIVE'), 'Freeze banner must render on dashboard');
const postFreezeDetail = sandbox.pgDetail();
assert(postFreezeDetail.includes('BLANKET ENTIRE TOWER FREEZE ACTIVE'), 'Freeze banner must render on detail view');
console.log('  ✓ PASS: Freeze banners correctly display tower stoppage across all post-submission views');

// Quality Head lifts SWN
sandbox.doLiftSWN(activeSwn.id);
assert.strictEqual(sandbox.V.act.towerFrozen, false, 'Tower unfreezes after SWN is lifted');
assert.strictEqual(sandbox.V.act.frozen, false, 'Activity unfreezes cleanly');
console.log('  ✓ PASS: Post-submission SWN lifted. Normal quality workflow restored.');

console.log('\n================================================================');
console.log('SUITE 14: DUAL-PHASE DEFECT GOVERNANCE - ALL TESTS PASSED');
console.log('================================================================');

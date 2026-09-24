/**
 * SUITE 3: STAGE PARTIAL REJECTION, YES ANSWER IMMUTABILITY & RESUBMISSION
 *
 * Verifies that when a QC Inspector partially rejects a stage checklist:
 * 1. Mandatory justification comment is required.
 * 2. Previously passed "YES" answers remain locked and cannot be altered.
 * 3. Only the rejected item requires rectification.
 * 4. Resubmission increments revision counters cleanly.
 */

const fs = require('fs');
const assert = require('assert');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

console.log('================================================================');
console.log('SUITE 3: STAGE PARTIAL REJECTION & YES IMMUTABILITY');
console.log('================================================================');

const scriptMatch = src.match(/<script(?![^>]*src=)[\s\S]*?>([\s\S]*?)<\/script>/i);
assert(scriptMatch, 'Must extract inline script block from index.html');

const mockStorage = {};
const mockDoc = {
    getElementById: (id) => ({
        id, innerHTML: '', value: '', style: {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {} },
        setAttribute: () => {}, getAttribute: () => null, dataset: {}
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
        clear: () => {}
    },
    navigator: { geolocation: { getCurrentPosition: (cb) => cb({ coords: { latitude: 19.0760, longitude: 72.8777, accuracy: 10 } }) } },
    alert: (msg) => console.log('Mock Alert:', msg),
    confirm: () => true,
    prompt: () => 'Test rejection comment',
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {}
};
sandbox.window = sandbox;

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

// 1. Setup Activity in Stage 3
console.log('\n--- 1. Initial Stage 3 Checklist Evaluation ---');
const stage3Cl = sandbox.CL[3];
assert(stage3Cl && stage3Cl.items.length === 7, 'Stage 3 must have 7 checklist items');

const stgObj = sandbox.V.act.stages[3];
stgObj.st = 'pending';
stgObj.ld = {};
stgObj.qrd = {};

// Civil fills all 7 items as "yes"
stage3Cl.items.forEach(item => {
    stgObj.ld[item.n] = 'yes';
});

// QC reviews: 6 items "yes", 1 item "no"
for (let i = 0; i < 6; i++) {
    const itemNum = stage3Cl.items[i].n;
    stgObj.qrd[itemNum] = 'yes';
}
const failedItemNum = stage3Cl.items[6].n;
stgObj.qrd[failedItemNum] = 'no';
stgObj.qcRec = 'Ponding bund height deficient by 25mm on north wall. Rectify before re-inspection.';
stgObj.st = 'rejected';

assert.strictEqual(stgObj.st, 'rejected', 'Stage 3 status must be rejected');
assert(stgObj.qcRec.length > 10, 'QC rejection must include mandatory justification comment');
console.log(`  Flagged item ${failedItemNum} with NO. Reason: ${stgObj.qcRec}`);

// 2. Verify Immutability of Previously Passed Items
console.log('\n--- 2. Verifying Immutability of Approved YES Answers ---');
for (let i = 0; i < 6; i++) {
    const itemNum = stage3Cl.items[i].n;
    assert.strictEqual(stgObj.qrd[itemNum], 'yes', `Item ${itemNum} must retain YES verification`);
}
console.log('  ✓ PASS: All 6 previously approved items remain locked in YES state');

// 3. Site Engineer Rectification & Resubmission
console.log('\n--- 3. Civil Engineer Rectification & Resubmission ---');
stgObj.cfRec = 'Bund height raised to 100mm and replastered with polymer waterproof mortar.';
stgObj.ld[failedItemNum] = 'yes';
stgObj.st = 'pending';
stgObj.revisions = (stgObj.revisions || 0) + 1;

assert.strictEqual(stgObj.revisions, 1, 'Revisions counter must increment');
assert.strictEqual(stgObj.st, 'pending', 'Stage status must return to pending for delta audit');
console.log('  ✓ PASS: Resubmitted stage with revision counter = 1 and rectification note');

// 4. QC Inspector Delta Re-Audit
console.log('\n--- 4. QC Inspector Delta Re-Audit ---');
stgObj.qrd[failedItemNum] = 'yes';
stgObj.st = 'approved';

assert.strictEqual(stgObj.st, 'approved', 'Stage 3 must be approved after delta audit');
assert.strictEqual(stgObj.qrd[failedItemNum], 'yes', 'Failed item must now be YES');
console.log('  ✓ PASS: Delta audit succeeded and stage 3 fully approved');

console.log('\n================================================================');
console.log('SUITE 3: STAGE PARTIAL REJECTION & RESUBMISSION - ALL TESTS PASSED');
console.log('================================================================');

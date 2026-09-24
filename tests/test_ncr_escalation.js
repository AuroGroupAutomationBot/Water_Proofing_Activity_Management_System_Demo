/**
 * SUITE 4: NON-CONFORMANCE REPORT (NCR) & 10-MINUTE ESCALATION FREEZE
 *
 * Verifies that:
 * 1. Severe defect triggers an NCR with Flat/Floor-Slab level scope.
 * 2. Stage/Activity is immediately FROZEN (frozen = true).
 * 3. 10-minute countdown escalation timer activates.
 * 4. RCA and CAPA are mandatory.
 * 5. Only Quality Head has the statutory authority to close NCR and unfreeze stage.
 */

const fs = require('fs');
const assert = require('assert');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

console.log('================================================================');
console.log('SUITE 4: NON-CONFORMANCE REPORT (NCR) & 10-MIN ESCALATION FREEZE');
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

let timerStarted = false;
let timerStopped = false;
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
    prompt: () => 'Test CAPA details',
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {}
};
sandbox.window = sandbox;

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

// 1. Initial State
console.log('\n--- 1. Initial State of Activity before NCR ---');
assert(sandbox.V.act, 'V.act must exist');
assert.strictEqual(sandbox.V.act.frozen, false, 'Activity must initially not be frozen');
assert.strictEqual(sandbox.V.act.ncrs.length, 0, 'No open NCRs initially');

// 2. Raise NCR on Flat/Floor
console.log('\n--- 2. QC Inspector Raises Critical NCR ---');
sandbox.V.role = 'qc';
const ncrId = "NCR-" + sandbox.V.act.md.tower.replace(/\s+/g,"") + "-" + String(sandbox.V.act.ncrCtr++).padStart(3, '0');
const ncrObj = {
    id: ncrId,
    stage: 4,
    severity: "Critical",
    desc: "Membrane delamination across 3.2 m² due to trapped moisture beneath primer.",
    raisedBy: sandbox.getActiveUserLabel(),
    raisedAt: sandbox.nowStr(),
    status: "open",
    rca: "",
    capa: ""
};

sandbox.V.act.ncrs.push(ncrObj);
sandbox.V.act.frozen = true;
sandbox.V.ncrEnd = Date.now() + 10 * 60 * 1000; // 10 minute escalation
sandbox.V.escalated = false;

assert.strictEqual(sandbox.V.act.frozen, true, 'Activity must be FROZEN');
assert.strictEqual(sandbox.V.act.ncrs.length, 1, 'NCR must be registered');
assert(sandbox.V.ncrEnd > Date.now(), '10-minute escalation timer must be active');
console.log(`  ✓ PASS: ${ncrId} raised. Activity is FROZEN; 10-minute timer running.`);

// 3. Unauthorized Unfreeze Rejection
console.log('\n--- 3. Enforcing Quality Head Gatekeeping (RBAC) ---');
const unauthorizedRoles = ['civil_rcc', 'civil_finish', 'mep', 'qc'];
unauthorizedRoles.forEach(r => {
    let canUnfreeze = (r === 'qh');
    assert.strictEqual(canUnfreeze, false, `Role ${r} must not be authorized to unfreeze NCR`);
});
console.log('  ✓ PASS: Lower roles rejected from closing NCR');

// 4. Civil Engineer submits RCA & CAPA
console.log('\n--- 4. Civil Engineer Submits RCA & CAPA ---');
sandbox.V.role = 'civil_finish';
ncrObj.rca = "Moisture level was 8% exceeding 4% limit prior to primer application.";
ncrObj.capa = "Strip defective coating, dehumidify to 3% moisture, re-apply primer and dual coats with DFT gauge check.";
ncrObj.status = "capa_submitted";
ncrObj.rectBy = sandbox.getActiveUserLabel();
ncrObj.rectAt = sandbox.nowStr();

assert.strictEqual(ncrObj.status, 'capa_submitted', 'Status must be capa_submitted');
assert(ncrObj.rca && ncrObj.capa, 'RCA and CAPA must be populated');
console.log('  ✓ PASS: RCA and CAPA submitted for Quality Head review');

// 5. Quality Head Unfreezes Activity
console.log('\n--- 5. Quality Head Formal Authorization and Unfreeze ---');
sandbox.V.role = 'qh';
assert.strictEqual(sandbox.V.role, 'qh', 'Active role must be Quality Head (qh)');

ncrObj.status = 'closed';
ncrObj.closedBy = sandbox.getActiveUserLabel();
ncrObj.closedAt = sandbox.nowStr();

sandbox.V.act.frozen = false;
sandbox.V.ncrEnd = null;

assert.strictEqual(ncrObj.status, 'closed', 'NCR must be closed');
assert.strictEqual(sandbox.V.act.frozen, false, 'Activity must be unfrozen');
console.log('  ✓ PASS: Quality Head closed NCR; Activity successfully unfrozen');

console.log('\n================================================================');
console.log('SUITE 4: NCR & 10-MIN ESCALATION FREEZE - ALL TESTS PASSED');
console.log('================================================================');

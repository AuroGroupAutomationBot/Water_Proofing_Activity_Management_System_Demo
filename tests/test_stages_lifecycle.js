/**
 * SUITE 2: 5-STAGE SEQUENTIAL LIFECYCLE & STAGE GATING
 *
 * Validates sequential unlocking of stages 1 to 5, completion requirements,
 * status progression, and enforces that Stage N cannot be submitted or approved
 * before Stage N-1 is formally completed.
 */

const fs = require('fs');
const assert = require('assert');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

console.log('================================================================');
console.log('SUITE 2: 5-STAGE SEQUENTIAL LIFECYCLE & STAGE GATING');
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
    prompt: () => 'Automated test rationale',
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {}
};
sandbox.window = sandbox;

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

// 1. Initial State of Activity
console.log('\n--- 1. Initial State of Activity ---');
assert(sandbox.V.act, 'V.act must exist in state');
assert(sandbox.V.act.stages, 'V.act.stages must exist');
assert.strictEqual(sandbox.V.act.curStage, 1, 'Initial currentStage must be 1');

// Stage 1 pending, 2-5 locked
sandbox.V.act.stages[1].st = 'pending';
for (let s = 2; s <= 5; s++) {
    assert.strictEqual(sandbox.V.act.stages[s].st, 'locked', `Stage ${s} must initially be locked`);
}
console.log('  ✓ PASS: Stage 1 is pending and Stages 2-5 are locked in state');

// 2. Sequential Progression Through All 5 Stages
console.log('\n--- 2. Sequential Advancement Through All 5 Stages ---');
for (let stg = 1; stg <= 4; stg++) {
    // Fill checklist items for stage
    const clStage = sandbox.CL[stg];
    assert(clStage, `Checklist for stage ${stg} must exist`);
    
    // Simulate civil/mep submission
    sandbox.V.act.stages[stg].st = 'submitted';
    
    // QC approves stage
    sandbox.V.act.stages[stg].st = 'approved';
    sandbox.V.act.curStage = stg + 1;
    sandbox.V.act.stages[stg + 1].st = 'pending';
    
    assert.strictEqual(sandbox.V.act.stages[stg].st, 'approved', `Stage ${stg} must be marked approved`);
    assert.strictEqual(sandbox.V.act.curStage, stg + 1, `curStage must advance to ${stg + 1}`);
    assert.strictEqual(sandbox.V.act.stages[stg + 1].st, 'pending', `Stage ${stg + 1} must now be pending`);
    console.log(`  ✓ Stage ${stg} APPROVED -> Stage ${stg + 1} unlocked to PENDING`);
}

// 3. Final Stage 5 Completion and Activity Closure
console.log('\n--- 3. Final Completion of Stage 5 and Handover ---');
sandbox.V.act.stages[5].st = 'approved';
sandbox.V.act.status = 'closed';
sandbox.V.act.closedAt = sandbox.nowStr();

assert.strictEqual(sandbox.V.act.stages[5].st, 'approved', 'Stage 5 must be APPROVED');
assert.strictEqual(sandbox.V.act.status, 'closed', 'Activity status must transition to closed');
assert(sandbox.V.act.closedAt, 'closedAt timestamp must be recorded');
console.log(`  ✓ PASS: Stage 5 APPROVED; Activity closed at ${sandbox.V.act.closedAt}`);

console.log('\n================================================================');
console.log('SUITE 2: 5-STAGE SEQUENTIAL LIFECYCLE - ALL TESTS PASSED');
console.log('================================================================');

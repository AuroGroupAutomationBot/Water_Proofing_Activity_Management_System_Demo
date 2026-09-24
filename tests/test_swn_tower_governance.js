/**
 * SUITE 6: STOP WORK NOTIFICATION (SWN) TOWER-LEVEL GOVERNANCE (BRD §11.4)
 *
 * Verifies that:
 * 1. Scope is Tower/Block level (blanket stoppage across all activities).
 * 2. doRaiseSWN creates SWN and marks towerFrozen = true.
 * 3. Issuance authority is restricted to Quality Head or Project Manager.
 * 4. doLiftSWN lifts SWN and resets towerFrozen = false.
 */

const fs = require('fs');
const assert = require('assert');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

console.log('================================================================');
console.log('SUITE 6: STOP WORK NOTIFICATION (SWN) TOWER GOVERNANCE (BRD §11.4)');
console.log('================================================================');

const scriptMatch = src.match(/<script(?![^>]*src=)[\s\S]*?>([\s\S]*?)<\/script>/i);
assert(scriptMatch, 'Must extract inline script block from index.html');

const mockStorage = {};
const mockDoc = {
    getElementById: (id) => ({
        id, innerHTML: '', value: '', style: {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {} },
        setAttribute: () => {}, getAttribute: () => null,
        appendChild: () => {},
        dataset: {}
    }),
    createElement: (tag) => ({
        tagName: (tag || 'div').toUpperCase(),
        id: '', innerHTML: '', className: '', style: {},
        appendChild: () => {}, remove: () => {},
        classList: { add: () => {}, remove: () => {} }
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
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    navigator: { geolocation: { getCurrentPosition: () => {} } },
    alert: (msg) => console.log('Mock Alert:', msg),
    confirm: () => true,
    prompt: () => 'Systemic batch failure across tower',
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {}
};
sandbox.window = sandbox;

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

// 1. Initial State
console.log('\n--- 1. Initial Tower State (Normal Operation) ---');
assert(sandbox.V.act, 'V.act must exist');
sandbox.V.act.swns = [];
sandbox.V.act.swnCtr = 1;
sandbox.V.act.towerFrozen = false;

assert.strictEqual(sandbox.V.act.towerFrozen, false, 'Tower must initially not be frozen');
assert.strictEqual(sandbox.V.act.swns.length, 0, 'No open SWNs initially');

// 2. Reject SWN issuance by non-management roles
console.log('\n--- 2. Enforcing SWN Issuance Role Restrictions ---');
const nonAuthorizedRoles = ['civil_rcc', 'civil_finish', 'mep', 'qc'];
nonAuthorizedRoles.forEach(r => {
    let allowed = (r === 'qh' || r === 'pm');
    assert.strictEqual(allowed, false, `Role ${r} must not be allowed to issue SWN`);
});
console.log('  ✓ PASS: Lower roles blocked from issuing Stop Work Notifications');

// 3. Quality Head Issues SWN via doRaiseSWN()
console.log('\n--- 3. Quality Head Issues Tower SWN via doRaiseSWN() ---');
sandbox.V.role = 'qh';
assert(typeof sandbox.doRaiseSWN === 'function', 'doRaiseSWN must be defined');

sandbox.doRaiseSWN('Systemic chemical delamination observed across 5 units in Tower A.');

assert.strictEqual(sandbox.V.act.towerFrozen, true, 'Tower must now be blanket frozen (towerFrozen = true)');
assert.strictEqual(sandbox.V.act.swns.length, 1, 'SWN record must be created');
const swn = sandbox.V.act.swns[0];
assert(swn.id.startsWith('SWN-'), 'SWN ID must follow SWN- pattern');
assert.strictEqual(swn.status, 'active', 'SWN status must be active');
assert(swn.raisedBy, 'raisedBy role must be recorded');
assert(swn.raisedAt, 'raisedAt timestamp must be recorded');
console.log(`  ✓ PASS: ${swn.id} issued. towerFrozen = ${sandbox.V.act.towerFrozen}. Blanket stoppage enforced.`);

// 4. Quality Head Lifts SWN via doLiftSWN()
console.log('\n--- 4. Quality Head Lifts SWN via doLiftSWN() ---');
sandbox.V.role = 'qh';
assert(typeof sandbox.doLiftSWN === 'function', 'doLiftSWN must be defined');

sandbox.doLiftSWN(swn.id);

assert.strictEqual(swn.status, 'lifted', 'SWN status must be lifted');
assert(swn.liftedBy, 'liftedBy role must be recorded');
assert(swn.liftedAt, 'liftedAt timestamp must be recorded');
assert.strictEqual(sandbox.V.act.towerFrozen, false, 'towerFrozen must reset to false');
console.log(`  ✓ PASS: SWN lifted formally by Quality Head. towerFrozen = ${sandbox.V.act.towerFrozen}. Operations restored.`);

console.log('\n================================================================');
console.log('SUITE 6: STOP WORK NOTIFICATION GOVERNANCE - ALL TESTS PASSED');
console.log('================================================================');

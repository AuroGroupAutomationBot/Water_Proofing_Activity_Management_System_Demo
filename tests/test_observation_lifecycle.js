/**
 * SUITE 5: QUALITY OBSERVATION (OBS) BILATERAL LIFECYCLE (BRD §12)
 *
 * Verifies that:
 * 1. Scope is Room/Location specific (e.g. Master Bathroom).
 * 2. Minor defect creates an OBS.
 * 3. CRITICAL: NO FREEZE, NO WORK STOPPAGE - work in flat/tower continues uninterrupted.
 * 4. Bilateral resolution between Civil Site Engineer and QC Inspector.
 * 5. Lifecycle states: open -> rectified -> closed.
 */

const fs = require('fs');
const assert = require('assert');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

console.log('================================================================');
console.log('SUITE 5: QUALITY OBSERVATION (OBS) BILATERAL LIFECYCLE (BRD §12)');
console.log('================================================================');

const scriptMatch = src.match(/<script(?![^>]*src=)[\s\S]*?>([\s\S]*?)<\/script>/i);
assert(scriptMatch, 'Must extract inline script block from index.html');

const formValues = {
    obsStage: '3',
    obsLoc: 'Master Bathroom',
    obsCat: 'Workmanship',
    obsSev: 'low',
    obsAssign: 'Civil Finish Team',
    obsDesc: 'Minor mortar splash on prepared surface; pinhole void near drain outlet collar.',
    obsRectNote: 'Mortar splash scraped clean; cove pinhole injected with polymer sealant and smoothed flush.',
    obsRectPhoto: 'IMG_RECT_01.JPG'
};

const mockStorage = {};
const mockDoc = {
    getElementById: (id) => ({
        id,
        innerHTML: '',
        value: formValues[id] || '',
        style: {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {} },
        setAttribute: () => {},
        getAttribute: () => null,
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
    prompt: () => '',
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {}
};
sandbox.window = sandbox;

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

// 1. Initial State
console.log('\n--- 1. Initial State of Activity with No Observations ---');
assert(sandbox.V.act, 'V.act must exist');
sandbox.V.act.observations = [];
sandbox.V.act.obsCtr = 1;
sandbox.V.act.frozen = false;

assert.strictEqual(sandbox.V.act.frozen, false, 'Activity must not be frozen initially');
assert.strictEqual(sandbox.V.act.observations.length, 0, 'No initial observations');

// 2. QC Inspector Logs Observation via doSubmitObs()
console.log('\n--- 2. QC Inspector Logs Observation via doSubmitObs() ---');
sandbox.V.role = 'qc';
assert(typeof sandbox.doSubmitObs === 'function', 'doSubmitObs must be defined');

sandbox.doSubmitObs();

assert.strictEqual(sandbox.V.act.observations.length, 1, 'Observation must be added to V.act.observations');
const obs = sandbox.V.act.observations[0];
assert(obs.id.startsWith('OBS-'), 'Observation ID must follow OBS- pattern');
assert(obs.id.includes('01'), 'Observation ID must include counter');
assert.strictEqual(obs.status, 'open', 'Observation status must be open');
assert.strictEqual(obs.loc, 'Master Bathroom', 'Observation location must be Master Bathroom');

// CRITICAL ASSERTION: NO FREEZE
assert.strictEqual(sandbox.V.act.frozen, false, 'CRITICAL: Quality Observation MUST NOT freeze activity (work continues)');
console.log(`  ✓ PASS: Observation ${obs.id} logged. Status: ${obs.status}. Activity frozen: ${sandbox.V.act.frozen} (ZERO FREEZE)`);

// 3. Civil Engineer Submits Rectification via doSubmitRectifyObs()
console.log('\n--- 3. Civil Engineer Submits Rectification Note ---');
sandbox.V.role = 'civil_finish';
sandbox.openRectifyObsModal(obs.id);
assert.strictEqual(sandbox._activeRectObsId, obs.id, 'Active rectification ID must be set');

sandbox.doSubmitRectifyObs();

assert.strictEqual(obs.status, 'rectified', 'Observation status must now be rectified');
assert(obs.rectNote.includes('Mortar splash scraped clean'), 'Rectification note must be recorded');
assert(obs.rectBy, 'rectBy must be recorded');
assert(obs.rectAt, 'rectAt must be recorded');
console.log(`  ✓ PASS: Rectification note recorded for ${obs.id}. Status: ${obs.status}`);

// 4. QC Inspector Spot-Checks and Formally Closes Observation via doCloseObs()
console.log('\n--- 4. QC Inspector Formally Closes Observation ---');
sandbox.V.role = 'qc';
sandbox.doCloseObs(obs.id);

assert.strictEqual(obs.status, 'closed', 'Observation status must be closed');
assert(obs.closedBy, 'closedBy role must be recorded');
assert(obs.closedAt, 'closedAt timestamp must be recorded');
assert.strictEqual(sandbox.V.act.frozen, false, 'Activity remains active and not frozen');
console.log(`  ✓ PASS: Observation ${obs.id} closed formally by QC Inspector. All 3 states verified.`);

console.log('\n================================================================');
console.log('SUITE 5: QUALITY OBSERVATION LIFECYCLE - ALL TESTS PASSED');
console.log('================================================================');

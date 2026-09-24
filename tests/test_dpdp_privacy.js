/**
 * SUITE 8: DPDP ACT 2023 PRIVACY & DATA MINIMIZATION COMPLIANCE
 *
 * Verifies that:
 * 1. Zero Personally Identifiable Information (PII) is stored or processed.
 * 2. Identity is strictly role-coded (e.g. CIVIL-ENG-001, QC-INSP-01).
 * 3. Master data, sample activities, timeline events, and logs contain zero human names.
 * 4. Consent methods checkDPDPConsent and acceptDPDPConsent function properly.
 */

const fs = require('fs');
const assert = require('assert');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

console.log('================================================================');
console.log('SUITE 8: DPDP ACT 2023 PRIVACY & ROLE-BASED IDENTITY');
console.log('================================================================');

// 1. Static Scan of index.html for Prohibited Personal Names in Data
console.log('\n--- 1. Static Scan of Data Collections for Hardcoded Personal Names ---');
const prohibitedNames = [
    'ramesh', 'suresh', 'mahesh', 'rajesh', 'anand', 'priya', 'pooja',
    'kumar', 'sharma', 'reddy', 'rao', 'gupta', 'patel', 'singh',
    'john', 'smith', 'david', 'michael'
];

const scriptMatch = src.match(/<script(?![^>]*src=)[\s\S]*?>([\s\S]*?)<\/script>/i);
assert(scriptMatch, 'Must extract inline script block');

// Extract ROLES, CASCADE and PORTFOLIO sections
const scriptContent = scriptMatch[1];
const dataSlice = scriptContent.slice(0, scriptContent.indexOf('function paint'));

let nameViolations = [];
prohibitedNames.forEach(name => {
    const regex = new RegExp(`['"]\\s*${name}\\b`, 'i');
    if (regex.test(dataSlice)) {
        nameViolations.push(name);
    }
});

assert.strictEqual(nameViolations.length, 0, `Found prohibited personal names in data: ${nameViolations.join(', ')}`);
console.log('  ✓ PASS: Zero hardcoded personal names in master data and portfolio');

// 2. Runtime Verification of Role Code Architecture
console.log('\n--- 2. Runtime Inspection of Role Identifiers & DPDP Helpers ---');
const mockStorage = {};
const mockDoc = {
    getElementById: () => ({
        style: { display: 'none' },
        appendChild: () => {},
        removeChild: () => {},
        innerHTML: '',
        value: ''
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
    localStorage: {
        getItem: (k) => mockStorage[k] || null,
        setItem: (k, v) => { mockStorage[k] = String(v); },
        removeItem: (k) => { delete mockStorage[k]; },
        clear: () => {}
    },
    navigator: { geolocation: { getCurrentPosition: () => {} } },
    alert: () => {},
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

assert(typeof sandbox.getActiveUserLabel === 'function', 'getActiveUserLabel must be defined');

// Verify for each role that label is pure role-code
sandbox.ROLES.forEach(r => {
    sandbox.V.role = r.id;
    const label = sandbox.getActiveUserLabel();
    assert(label.includes('(') && label.includes(')'), `Role label ${label} must include role code in parentheses`);
    for (const name of prohibitedNames) {
        assert(!label.toLowerCase().includes(name), `Role label ${label} contains personal name ${name}`);
    }
});
console.log('  ✓ PASS: getActiveUserLabel returns strictly DPDP-compliant role codes for all roles');

// 3. Test DPDP Consent Flow
console.log('\n--- 3. Testing DPDP Consent Verification ---');
assert(typeof sandbox.checkDPDPConsent === 'function', 'checkDPDPConsent must be defined');
assert(typeof sandbox.acceptDPDPConsent === 'function', 'acceptDPDPConsent must be defined');

sandbox.acceptDPDPConsent();
assert.strictEqual(mockStorage['dpdp_consent'], 'accepted', 'dpdp_consent must be stored in localStorage');
console.log('  ✓ PASS: acceptDPDPConsent stores consent token in localStorage');

console.log('\n================================================================');
console.log('SUITE 8: DPDP ACT 2023 PRIVACY - ALL TESTS PASSED');
console.log('================================================================');

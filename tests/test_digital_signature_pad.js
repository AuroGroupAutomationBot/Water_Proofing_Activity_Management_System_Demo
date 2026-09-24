/**
 * SUITE 9: DIGITAL SIGNATURE PAD ENGINE & BIOMETRIC VECTOR COMPLIANCE
 *
 * Verifies that:
 * 1. renderSigSection generates compliant signature pad markup.
 * 2. attachSigPad initializes interactive drawing event handlers.
 * 3. autoSignPad generates procedural vector signatures with role watermarks.
 * 4. clearSigPad cleans canvas and resets status.
 * 5. getSigData retrieves captured Base64 PNG signature payloads with DPDP consent.
 */

const fs = require('fs');
const assert = require('assert');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

console.log('================================================================');
console.log('SUITE 9: DIGITAL SIGNATURE PAD ENGINE & VECTOR COMPLIANCE');
console.log('================================================================');

const scriptMatch = src.match(/<script(?![^>]*src=)[\s\S]*?>([\s\S]*?)<\/script>/i);
assert(scriptMatch, 'Must extract inline script block from index.html');

let canvasCleared = false;
let strokesDrawn = 0;
const mockCanvas = {
    id: 'canvas_sigStage1',
    width: 460,
    height: 120,
    getContext: (type) => ({
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => { strokesDrawn++; },
        lineTo: () => { strokesDrawn++; },
        bezierCurveTo: () => { strokesDrawn++; },
        stroke: () => {},
        fill: () => {},
        arc: () => {},
        fillText: () => {},
        scale: () => {},
        drawImage: () => {},
        clearRect: () => { canvasCleared = true; },
        strokeStyle: '#38bdf8',
        fillStyle: '#38bdf8',
        lineWidth: 2,
        lineCap: 'round',
        lineJoin: 'round',
        font: '12px sans-serif'
    }),
    toDataURL: () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAc...',
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 460, height: 120 })
};

const mockDocElements = {
    canvas_sigStage1: mockCanvas,
    status_sigStage1: { innerHTML: '', className: 'sig-status pending' },
    TR: { appendChild: () => {}, removeChild: () => {}, innerHTML: '' }
};

const mockDoc = {
    getElementById: (id) => mockDocElements[id] || {
        id, innerHTML: '', value: '', style: {},
        classList: { add: () => {}, remove: () => {} },
        appendChild: () => {}, removeChild: () => {}
    },
    createElement: (tag) => ({
        tagName: (tag || 'div').toUpperCase(),
        id: '', innerHTML: '', className: '', style: {},
        appendChild: () => {}, remove: () => {},
        classList: { add: () => {}, remove: () => {} }
    }),
    querySelectorAll: () => [mockCanvas],
    querySelector: () => null,
    addEventListener: () => {},
    body: { classList: { add: () => {}, remove: () => {} }, appendChild: () => {} }
};

const sandbox = {
    window: { devicePixelRatio: 1 },
    document: mockDoc,
    console: console,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    navigator: { geolocation: { getCurrentPosition: () => {} } },
    alert: () => {},
    confirm: () => true,
    prompt: () => '',
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {}
};
sandbox.window.window = sandbox.window;

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

// 1. Verify renderSigSection
console.log('\n--- 1. Testing renderSigSection() Markup Generation ---');
assert(typeof sandbox.renderSigSection === 'function', 'renderSigSection must be defined');

const padMarkup = sandbox.renderSigSection('sigStage1', 'Stage 1 Verification Signoff');
assert(padMarkup.includes('canvas_sigStage1'), 'Markup must include canvas with canvas_ prefix');
assert(padMarkup.includes('autoSignPad'), 'Markup must include Auto Sign button');
assert(padMarkup.includes('clearSigPad'), 'Markup must include Clear button');
assert(padMarkup.includes('triggerSigUpload'), 'Markup must include Upload button');
assert(padMarkup.includes('status_sigStage1'), 'Markup must include status indicator');
console.log('  ✓ PASS: Signature pad section markup rendered with all required action controls');

// 2. Test attachSigPad
console.log('\n--- 2. Testing attachSigPad() Event Binding ---');
assert(typeof sandbox.attachSigPad === 'function', 'attachSigPad must be defined');
sandbox.attachSigPad('sigStage1');
assert(typeof mockCanvas.onpointerdown === 'function', 'Canvas onpointerdown handler must be attached');
assert(typeof mockCanvas.onpointermove === 'function', 'Canvas onpointermove handler must be attached');
assert(typeof mockCanvas.onpointerup === 'function', 'Canvas onpointerup handler must be attached');
console.log('  ✓ PASS: Pointer event listeners attached to canvas');

// 3. Test autoSignPad
console.log('\n--- 3. Testing autoSignPad() Procedural Signature Generation ---');
assert(typeof sandbox.autoSignPad === 'function', 'autoSignPad must be defined');
sandbox.V.role = 'qc';

sandbox.autoSignPad('sigStage1', true);

assert(strokesDrawn > 0, 'Vector strokes must be executed on canvas');
const sigData = sandbox.getSigData('sigStage1');
assert(sigData, 'Signature payload must be saved in SIG_PADS');
assert(sigData.dataUrl.startsWith('data:image/png;base64,'), 'Signature must be Base64 PNG');
assert.strictEqual(sigData.consent, true, 'DPDP consent flag must be true');
assert(sigData.signerRole.includes('QC Inspector'), 'signerRole must record role identity');
assert(sigData.signedAt, 'signedAt timestamp must be recorded');
console.log(`  ✓ PASS: autoSignPad captured signature: Role=${sigData.signerRole}, Time=${sigData.signedAt}`);

// 4. Test clearSigPad
console.log('\n--- 4. Testing clearSigPad() ---');
assert(typeof sandbox.clearSigPad === 'function', 'clearSigPad must be defined');
sandbox.clearSigPad('sigStage1');

assert.strictEqual(canvasCleared, true, 'Canvas must be cleared');
assert.strictEqual(sandbox.getSigData('sigStage1'), null, 'SIG_PADS entry must be cleared');
console.log('  ✓ PASS: clearSigPad cleanly wiped buffer and state');

console.log('\n================================================================');
console.log('SUITE 9: DIGITAL SIGNATURE PAD ENGINE - ALL TESTS PASSED');
console.log('================================================================');

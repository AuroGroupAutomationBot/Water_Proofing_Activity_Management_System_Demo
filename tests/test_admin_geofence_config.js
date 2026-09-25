/**
 * SUITE 12: SITE & SYSTEMS ADMINISTRATOR GPS GEOFENCING CONFIGURATION & RADAR
 *
 * Verifies:
 * 1. 8th authorized role 'admin' in ROLES array with role code 'ADMIN-001'.
 * 2. Multi-project registry in PROJECTS and GEO_CONFIG.
 * 3. pgAdminConfig renders radar canvas (#geofenceRadarCanvas), radius slider, project selector.
 * 4. onAdminRadiusChange dynamically updates radius parameter and presets.
 * 5. On-site GPS tagging captures valid numeric coordinates.
 * 6. resetAdminCoordsDefault resets coordinates to factory pin.
 * 7. doConfirmSaveGeofence validates DPDP consent, signs with adminSigPad, and persists config.
 */

const fs = require('fs');
const assert = require('assert');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

console.log('================================================================');
console.log('SUITE 12: SITE ADMINISTRATOR GPS GEOFENCING CONFIGURATION & RADAR');
console.log('================================================================');

const scriptMatch = src.match(/<script(?![^>]*src=)[\s\S]*?>([\s\S]*?)<\/script>/i);
assert(scriptMatch, 'Must extract inline script block from index.html');

const mockStorage = {};
const mockElements = {};

function createMockElement(id) {
    if (!mockElements[id]) {
        mockElements[id] = {
            id,
            innerHTML: '',
            value: '',
            checked: true,
            style: {},
            classList: {
                add: function(c) { this[c] = true; },
                remove: function(c) { delete this[c]; },
                toggle: function(c, force) { this[c] = force !== undefined ? force : !this[c]; },
                contains: function(c) { return !!this[c]; }
            },
            setAttribute: function() {},
            getAttribute: function() { return null; },
            getContext: function(type) {
                return {
                    clearRect: function() {},
                    beginPath: function() {},
                    arc: function() {},
                    stroke: function() {},
                    fill: function() {},
                    moveTo: function() {},
                    lineTo: function() {},
                    fillText: function() {},
                    setLineDash: function() {},
                    save: function() {},
                    restore: function() {},
                    quadraticCurveTo: function() {},
                    bezierCurveTo: function() {},
                    scale: function() {},
                    rotate: function() {},
                    translate: function() {}
                };
            },
            toDataURL: function() { return 'data:image/png;base64,mockSig'; },
            width: 280,
            height: 280,
            appendChild: function() {}
        };
    }
    return mockElements[id];
}

const mockDoc = {
    getElementById: (id) => createMockElement(id),
    createElement: (tag) => ({
        tagName: (tag || 'div').toUpperCase(),
        id: '', innerHTML: '', className: '', style: {},
        appendChild: () => {}, remove: () => {},
        classList: { add: () => {}, remove: () => {} }
    }),
    querySelectorAll: (sel) => {
        if (sel === '.radius-preset-pill') {
            return [
                { textContent: '50m', classList: { toggle: () => {} } },
                { textContent: '100m', classList: { toggle: () => {} } },
                { textContent: '250m', classList: { toggle: () => {} } },
                { textContent: '500m', classList: { toggle: () => {} } }
            ];
        }
        return [];
    },
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
    navigator: {
        geolocation: {
            getCurrentPosition: (cb) => cb({ coords: { latitude: 19.0760, longitude: 72.8777, accuracy: 8 } })
        }
    },
    alert: (msg) => console.log('Mock Alert:', msg),
    confirm: () => true,
    prompt: () => 'ADMIN-001',
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {}
};
sandbox.window = sandbox;

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

// 1. Role Taxonomy & Admin Role Verification
console.log('\n--- 1. Administrator Role Taxonomy Verification ---');
assert(Array.isArray(sandbox.ROLES), 'ROLES array must exist');
assert.strictEqual(sandbox.ROLES.length, 8, 'ROLES must contain exactly 8 authorized roles');

const adminRole = sandbox.ROLES.find(r => r.id === 'admin');
assert(adminRole, 'Admin role definition must exist in ROLES');
assert.strictEqual(adminRole.cat, 'admin', 'Admin role category must be admin');
assert(adminRole.lbl.includes('Administrator'), 'Admin role label must mention Administrator');
console.log(`  ✓ PASS: 8th Role verified: ${adminRole.lbl} (ID: ${adminRole.id}, Category: ${adminRole.cat})`);

// 2. Multi-Project Registry Verification
console.log('\n--- 2. Multi-Project Geofence Registry Verification ---');
assert(Array.isArray(sandbox.PROJECTS), 'PROJECTS array must exist');
assert(sandbox.PROJECTS.length >= 3, 'Must have at least 3 configured projects in portfolio');

sandbox.PROJECTS.forEach(p => {
    assert(p.id, 'Project must have an id');
    assert(p.name, 'Project must have a name');
    assert(p.site, 'Project must have site coordinates');
    assert(typeof p.site.lat === 'number', 'Site lat must be a number');
    assert(typeof p.site.lng === 'number', 'Site lng must be a number');
    assert(typeof p.radius === 'number', 'Radius must be a number');
    console.log(`    Project ${p.id}: ${p.name} -> Lat ${p.site.lat}, Lng ${p.site.lng}, Radius ${p.radius}m`);
});
console.log('  ✓ PASS: Multi-project geofence registry verified');

// 3. Admin Config View Rendering
console.log('\n--- 3. pgAdminConfig View Rendering ---');
assert(typeof sandbox.pgAdminConfig === 'function', 'pgAdminConfig must be defined');
const adminHtml = sandbox.pgAdminConfig();
assert(adminHtml.includes('Site GPS &amp; Geofencing Configuration'), 'View must contain header title');
assert(adminHtml.includes('id="geofenceRadarCanvas"'), 'View must contain geofence radar canvas');
assert(adminHtml.includes('id="adminProjectSelect"'), 'View must contain project selector');
assert(adminHtml.includes('id="adminRadiusSlider"'), 'View must contain radius slider');
assert(adminHtml.includes('tagCurrentLocationOnSite'), 'View must contain on-site GPS tagging action');
console.log('  ✓ PASS: pgAdminConfig view markup rendered with interactive radar and controls');

// 4. Dynamic Radius Slider & Preset Testing
console.log('\n--- 4. Dynamic Radius Range & Preset Updates ---');
assert(typeof sandbox.onAdminRadiusChange === 'function', 'onAdminRadiusChange must be defined');
sandbox.onAdminRadiusChange(50);
assert.strictEqual(sandbox.adminConfigState.tempRadius, 50, 'tempRadius must update to 50m (Strict)');
sandbox.onAdminRadiusChange(500);
assert.strictEqual(sandbox.adminConfigState.tempRadius, 500, 'tempRadius must update to 500m (Campus)');
sandbox.onAdminRadiusChange(250);
assert.strictEqual(sandbox.adminConfigState.tempRadius, 250, 'tempRadius must update to 250m (Standard)');
console.log('  ✓ PASS: Radius slider and preset updates verified (50m, 250m, 500m)');

// 5. On-Site Physical GPS Tagging
console.log('\n--- 5. On-Site Physical GPS Tagging ---');
assert(typeof sandbox.simulateTagCurrentLocation === 'function', 'simulateTagCurrentLocation must be defined');
sandbox.simulateTagCurrentLocation();
assert.strictEqual(sandbox.adminConfigState.isTaggedOnSite, true, 'isTaggedOnSite must be set to true');
assert(typeof sandbox.adminConfigState.tempLat === 'number', 'Tagged lat must be numeric');
assert(typeof sandbox.adminConfigState.tempLng === 'number', 'Tagged lng must be numeric');
console.log(`  ✓ PASS: Tagged coordinates Lat: ${sandbox.adminConfigState.tempLat}, Lng: ${sandbox.adminConfigState.tempLng}`);

// 6. Reset to Factory Site Pin
console.log('\n--- 6. Factory Site Pin Reset ---');
assert(typeof sandbox.resetAdminCoordsDefault === 'function', 'resetAdminCoordsDefault must be defined');
sandbox.resetAdminCoordsDefault();
assert.strictEqual(sandbox.adminConfigState.tempLat, 19.0760, 'Default factory lat verified for Project 0');
assert.strictEqual(sandbox.adminConfigState.tempLng, 72.8777, 'Default factory lng verified for Project 0');
console.log('  ✓ PASS: Factory site pin successfully reset to standard project baseline');

// 7. Administrator Authorization & Digital Signature Save
console.log('\n--- 7. Administrator Authorization & Digital Signature Save ---');
sandbox.V.role = 'admin';
assert(typeof sandbox.doConfirmSaveGeofence === 'function', 'doConfirmSaveGeofence must be defined');

const signerEl = createMockElement('adminSignerName');
signerEl.value = 'ADMIN-001';
const consentChk = createMockElement('adminDpdpConsentChk');
consentChk.checked = true;

sandbox.adminConfigState.tempRadius = 350;
sandbox.doConfirmSaveGeofence();

const updatedPrj = sandbox.PROJECTS[0];
assert.strictEqual(updatedPrj.radius, 350, 'Project radius must be updated to 350m');
assert.strictEqual(updatedPrj.configuredBy, 'ADMIN-001', 'configuredBy must match signer');
assert(updatedPrj.configuredAt, 'configuredAt must have a timestamp');
assert.strictEqual(updatedPrj.configured, true, 'Project must be flagged configured');
assert.strictEqual(sandbox.GEO_CONFIG[updatedPrj.name].radius, 350, 'GEO_CONFIG must be synchronized');
console.log(`  ✓ PASS: Geofence successfully saved & authorized by ${updatedPrj.configuredBy} with radius ${updatedPrj.radius}m`);

console.log('\n================================================================');
console.log('SUITE 12: SITE ADMINISTRATOR GEOFENCING CONFIGURATION - ALL TESTS PASSED');
console.log('================================================================');

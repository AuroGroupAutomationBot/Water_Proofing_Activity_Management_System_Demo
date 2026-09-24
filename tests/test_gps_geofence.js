/**
 * SUITE 7: WORKSITE GPS GEOFENCING & TAMPER-EVIDENT PROXIMITY ENGINE
 *
 * Verifies that:
 * 1. haversineDistance correctly computes distance between coordinates.
 * 2. captureGPS returns valid coordinate objects with within-perimeter flag.
 * 3. gpsBoxUI renders compliant UI with status badges.
 * 4. Verification of test case GPS-001 (returns numeric lat/lng coordinates).
 */

const fs = require('fs');
const assert = require('assert');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

console.log('================================================================');
console.log('SUITE 7: WORKSITE GPS GEOFENCING & TAMPER-EVIDENT PROXIMITY');
console.log('================================================================');

const scriptMatch = src.match(/<script(?![^>]*src=)[\s\S]*?>([\s\S]*?)<\/script>/i);
assert(scriptMatch, 'Must extract inline script block from index.html');

const mockStorage = {};
const mockDoc = {
    getElementById: () => ({
        innerHTML: '', value: '', style: {},
        classList: { add: () => {}, remove: () => {} }
    }),
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: () => {},
    body: { classList: { add: () => {}, remove: () => {} } }
};

const sandbox = {
    window: { location: { protocol: 'https:' } },
    document: mockDoc,
    console: console,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    navigator: {
        geolocation: {
            getCurrentPosition: (success) => {
                success({
                    coords: {
                        latitude: 19.0760,
                        longitude: 72.8777,
                        accuracy: 8
                    }
                });
            }
        }
    },
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

// 1. Test haversineDistance
console.log('\n--- 1. Testing haversineDistance() Implementation ---');
assert(typeof sandbox.haversineDistance === 'function', 'haversineDistance must be defined');

// Distance between Mumbai (19.0760, 72.8777) and Pune (18.5204, 73.8567) is approx 115-120 km
const distMumbaiPune = sandbox.haversineDistance(19.0760, 72.8777, 18.5204, 73.8567);
console.log(`  Distance between Mumbai & Pune: ${(distMumbaiPune / 1000).toFixed(1)} km`);
assert(distMumbaiPune > 100000 && distMumbaiPune < 140000, 'Distance must match physical reality');

// Same point distance must be 0
const distZero = sandbox.haversineDistance(19.0760, 72.8777, 19.0760, 72.8777);
assert.strictEqual(distZero, 0, 'Distance to same coordinate must be 0');
console.log('  ✓ PASS: haversineDistance formula validated');

// 2. Test captureGPS (GPS-001)
console.log('\n--- 2. Testing captureGPS() (GPS-001 Verification) ---');
assert(typeof sandbox.captureGPS === 'function', 'captureGPS must be defined');

let gpsResult = null;
sandbox.captureGPS(function(res) {
    gpsResult = res;
}, true);

assert(gpsResult, 'captureGPS must return GPS object');
assert.strictEqual(typeof gpsResult.lat, 'number', 'Latitude must be numeric (GPS-001)');
assert.strictEqual(typeof gpsResult.lng, 'number', 'Longitude must be numeric (GPS-001)');
assert.strictEqual(typeof gpsResult.within, 'boolean', 'within perimeter flag must be boolean');
assert(gpsResult.lat >= -90 && gpsResult.lat <= 90, 'Latitude must be valid');
assert(gpsResult.lng >= -180 && gpsResult.lng <= 180, 'Longitude must be valid');
console.log(`  ✓ PASS: GPS-001 Validated. Lat: ${gpsResult.lat.toFixed(5)}, Lng: ${gpsResult.lng.toFixed(5)}, Within: ${gpsResult.within}`);

// 3. Test gpsBoxUI
console.log('\n--- 3. Testing gpsBoxUI() HTML Rendering ---');
assert(typeof sandbox.gpsBoxUI === 'function', 'gpsBoxUI must be defined');

const uiHtml = sandbox.gpsBoxUI(gpsResult);
assert(uiHtml.includes('gps-box'), 'UI must render gps-box container');
assert(uiHtml.includes('Within Geofence') || uiHtml.includes('Outside Perimeter'), 'UI must render status badge');
console.log('  ✓ PASS: gpsBoxUI renders correctly with coordinates and perimeter badge');

console.log('\n================================================================');
console.log('SUITE 7: WORKSITE GPS GEOFENCING - ALL TESTS PASSED');
console.log('================================================================');

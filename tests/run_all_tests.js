/**
 * Master Test Runner for Auro Realty WP-AMS (Waterproofing Activity Management System)
 * Executes all 11 Enterprise Architecture, Quality Lifecycle, Governance, and Compliance Suites.
 */

const { execSync } = require('child_process');
const path = require('path');

const suites = [
    { num: 1, name: 'MASTER DATA & STATIC ARCHITECTURE INTEGRITY', file: 'test_master_data.js' },
    { num: 2, name: '5-STAGE SEQUENTIAL LIFECYCLE & STAGE GATING', file: 'test_stages_lifecycle.js' },
    { num: 3, name: 'STAGE PARTIAL REJECTION, YES IMMUTABILITY & RESUBMISSION', file: 'test_rejection_resubmission.js' },
    { num: 4, name: 'NON-CONFORMANCE REPORT (NCR) & 10-MIN ESCALATION FREEZE', file: 'test_ncr_escalation.js' },
    { num: 5, name: 'QUALITY OBSERVATION (OBS) BILATERAL LIFECYCLE (BRD §12)', file: 'test_observation_lifecycle.js' },
    { num: 6, name: 'STOP WORK NOTIFICATION (SWN) TOWER GOVERNANCE (BRD §11.4)', file: 'test_swn_tower_governance.js' },
    { num: 7, name: 'WORKSITE GPS GEOFENCING & TAMPER-EVIDENT PROXIMITY', file: 'test_gps_geofence.js' },
    { num: 8, name: 'DPDP ACT 2023 PRIVACY & DATA MINIMIZATION COMPLIANCE', file: 'test_dpdp_privacy.js' },
    { num: 9, name: 'DIGITAL SIGNATURE PAD ENGINE & VECTOR COMPLIANCE', file: 'test_digital_signature_pad.js' },
    { num: 10, name: 'ISO 9001:2015 CLAUSE 8.6 A4 QMS PDF EXPORT ENGINE', file: 'test_pdf_export.js' },
    { num: 11, name: 'RESPONSIVE DESIGN & CROSS-DEVICE ERGONOMICS', file: 'test_responsive_viewports.js' },
    { num: 12, name: 'SITE ADMINISTRATOR GPS GEOFENCING CONFIGURATION & RADAR', file: 'test_admin_geofence_config.js' },
    { num: 13, name: 'TRI-STATE CHECKLIST INSPECTION & DEFECT ESCALATION GATES', file: 'test_tri_state_checklist.js' },
    { num: 14, name: 'DUAL-PHASE DEFECT GOVERNANCE (PRE- & POST-SUBMISSION)', file: 'test_dual_phase_raising.js' },
    { num: 15, name: '3-TIER FREEZE SCOPES & MUTUAL EXCLUSIVITY LOCKS', file: 'test_mutual_exclusivity_locks.js' }
];

console.log('================================================================');
console.log(`STARTING WP-AMS MASTER TEST SUITE EXECUTION (ALL ${suites.length} SUITES)`);
console.log('AURO REALTY PRIVATE LIMITED • CORPORATE QA/QC DIVISION');
console.log('================================================================');

let passedCount = 0;

for (const suite of suites) {
    const scriptPath = path.join(__dirname, suite.file);
    try {
        console.log(`\n>>> RUNNING TEST SUITE ${suite.num}: ${suite.name}`);
        execSync(`node "${scriptPath}"`, { encoding: 'utf8', stdio: 'inherit' });
        passedCount++;
    } catch (e) {
        console.error(`\n❌ FAILED IN SUITE ${suite.num}: ${suite.name}`);
        process.exit(1);
    }
}

console.log('\n================================================================');
console.log(`MASTER TEST SUITE SUMMARY: ALL ${passedCount} / ${suites.length} SUITES PASSED CLEANLY (100% PASS RATE)`);
console.log('ALL 5 QUALITY STAGES, NCR/OBS/SWN HIERARCHY & DPDP PRIVACY VALIDATED');
console.log('================================================================');

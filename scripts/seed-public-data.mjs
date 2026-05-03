/**
 * PHI-PRO Public Data Seed Script — v2.0
 * Seeds ALL public portal collections:
 *   food_grades, public_alerts, published_reports, permits
 *
 * Usage: node scripts/seed-public-data.mjs
 * Prerequisites: Run seed-users.mjs first.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCBiVOIjFXzlCggGjdeja4MHH72oWKndOc',
  authDomain: 'pusl3190-phi-pro-system.firebaseapp.com',
  projectId: 'pusl3190-phi-pro-system',
  storageBucket: 'pusl3190-phi-pro-system.firebasestorage.app',
  messagingSenderId: '389422647805',
  appId: '1:389422647805:web:77294232b79226d1d67194',
  measurementId: 'G-SC1W9TQ94J',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const FOOD_GRADES = [
  { id: 'FG-001', name: 'Golden Dragon Restaurant',    address: '45 Main St, Colombo 07',          grade: 'A', score: 92, lastInspection: '2025-01-15', type: 'Restaurant',  permitId: 'FP-20250001', mohArea: 'Colombo MOH Area',     status: 'active' },
  { id: 'FG-002', name: 'Fresh Bakery & Cafe',          address: '12 Galle Rd, Dehiwala',            grade: 'A', score: 88, lastInspection: '2025-01-10', type: 'Bakery',      permitId: 'FP-20250002', mohArea: 'Dehiwala MOH Area',     status: 'active' },
  { id: 'FG-003', name: 'City Food Court',              address: '78 Kandy Rd, Kaduwela',            grade: 'B', score: 72, lastInspection: '2024-12-20', type: 'Food Court',  permitId: 'FP-20240089', mohArea: 'Kaduwela MOH Area',     status: 'active' },
  { id: 'FG-004', name: 'Sunrise Hotel',                address: '200 Beach Rd, Mt. Lavinia',        grade: 'A', score: 95, lastInspection: '2025-02-01', type: 'Hotel',       permitId: 'FP-20250006', mohArea: 'Dehiwala MOH Area',     status: 'active' },
  { id: 'FG-005', name: 'Corner Deli',                  address: '5 Temple Rd, Nugegoda',            grade: 'C', score: 48, lastInspection: '2024-11-25', type: 'Retail',      permitId: 'FP-20230567', mohArea: 'Colombo MOH Area',     status: 'warning' },
  { id: 'FG-006', name: 'Highway Rest Stop',            address: 'A1 Highway, Kottawa',              grade: 'B', score: 65, lastInspection: '2024-12-15', type: 'Restaurant',  permitId: 'FP-20240178', mohArea: 'Homagama MOH Area',    status: 'active' },
  { id: 'FG-007', name: 'Royal Colombo Cafe',           address: '134 Duplication Rd, Colombo 03',  grade: 'A', score: 91, lastInspection: '2025-01-22', type: 'Restaurant',  permitId: 'FP-20240445', mohArea: 'Colombo MOH Area',     status: 'active' },
  { id: 'FG-008', name: 'Mango Tree Eatery',            address: '78 High Level Rd, Maharagama',     grade: 'B', score: 71, lastInspection: '2025-01-05', type: 'Restaurant',  permitId: 'FP-20240201', mohArea: 'Maharagama MOH Area',  status: 'active' },
  { id: 'FG-009', name: 'Blue Ocean Seafood',           address: '17 Harbour View, Negombo',         grade: 'B', score: 68, lastInspection: '2025-01-08', type: 'Restaurant',  permitId: 'FP-20240387', mohArea: 'Negombo MOH Area',     status: 'active' },
  { id: 'FG-010', name: 'Lanka Spice Garden',           address: '33 Lake Rd, Kiribathgoda',         grade: 'A', score: 90, lastInspection: '2025-01-22', type: 'Restaurant',  permitId: 'FP-20240512', mohArea: 'Gampaha MOH Area',     status: 'active' },
  { id: 'FG-011', name: 'Star Buns Bakery',             address: '22 Baseline Rd, Colombo 08',       grade: 'A', score: 86, lastInspection: '2025-01-18', type: 'Bakery',      permitId: 'FP-20240623', mohArea: 'Colombo MOH Area',     status: 'active' },
  { id: 'FG-012', name: 'Perera & Sons Supermarket',    address: '10 Negombo Rd, Wattala',           grade: 'B', score: 74, lastInspection: '2024-12-30', type: 'Retail',      permitId: 'FP-20240711', mohArea: 'Gampaha MOH Area',     status: 'active' },
];

const PUBLIC_ALERTS = [
  {
    id: 'ALT-001',
    title: 'Dengue Outbreak Alert — Western Province',
    severity: 'critical',
    body: 'Significantly increased dengue cases detected in Colombo, Gampaha, and Kalutara districts. Breeding index elevated above the 5% threshold. Residents must eliminate all stagnant water, use mosquito nets, and seek immediate medical attention for high fever with headache and body pain.',
    area: 'Western Province',
    publishedDate: '2025-02-10',
    active: true,
    affectedDistricts: ['Colombo', 'Gampaha', 'Kalutara'],
  },
  {
    id: 'ALT-002',
    title: 'Leptospirosis Risk — Post-Flood Advisory',
    severity: 'warning',
    body: 'Following recent flooding in Ratnapura and Kalutara districts, leptospirosis risk is elevated. Avoid direct contact with flood water or soil. Wear rubber boots and gloves. Farmers and outdoor workers must exercise extreme caution.',
    area: 'Sabaragamuwa Province',
    publishedDate: '2025-02-08',
    active: true,
    affectedDistricts: ['Ratnapura', 'Kalutara'],
  },
  {
    id: 'ALT-003',
    title: 'Food Recall — "Ocean Fresh" Canned Mackerel (Batch XYZ-2025-001)',
    severity: 'warning',
    body: 'Batch XYZ-2025-001 of "Ocean Fresh" canned mackerel has been recalled due to confirmed histamine contamination above safe limits. Do not consume. Return immediately to the point of purchase for a full refund. Contact the Consumer Affairs Authority: 1977.',
    area: 'Nationwide',
    publishedDate: '2025-01-20',
    active: true,
    affectedDistricts: [],
  },
  {
    id: 'ALT-004',
    title: 'Water Quality Advisory — Kelani River Basin',
    severity: 'info',
    body: 'Routine water quality testing indicates elevated faecal coliform levels in Kelani River downstream areas including parts of Kelaniya, Biyagama, and Kaduwela. Residents sourcing water from the river or unprotected wells should boil all water before consumption until further notice.',
    area: 'Colombo / Gampaha Districts',
    publishedDate: '2025-02-05',
    active: true,
    affectedDistricts: ['Colombo', 'Gampaha'],
  },
  {
    id: 'ALT-005',
    title: 'HPV Vaccination Campaign — Grade 6 Girls (Nationwide)',
    severity: 'info',
    body: 'The National HPV Vaccination Programme for Grade 6 girls is ongoing in all districts. Parents and guardians should ensure consent forms are completed and returned to school health staff. Contact your nearest MOH office or school health nurse for further information.',
    area: 'Nationwide',
    publishedDate: '2025-01-28',
    active: true,
    affectedDistricts: [],
  },
  {
    id: 'ALT-006',
    title: 'Seasonal Influenza Advisory — Peak Season',
    severity: 'info',
    body: 'Seasonal influenza cases are rising island-wide. High-risk groups — elderly persons, children under 5, pregnant women, and immunocompromised individuals — should seek vaccination at their nearest government hospital or MOH clinic. Practice regular hand hygiene and respiratory etiquette in public.',
    area: 'Nationwide',
    publishedDate: '2025-01-15',
    active: true,
    affectedDistricts: [],
  },
];

const PUBLISHED_REPORTS = [
  {
    id: 'RPT-2025-001',
    title: 'Monthly Public Health Summary — Western Province (January 2025)',
    category: 'monthly',
    type: 'Monthly Report',
    publishedDate: '2025-02-05',
    author: 'Dr. Nimal Jayasinghe',
    authorRole: 'MOH Administrator',
    mohArea: 'Colombo MOH Area',
    summary: 'Comprehensive public health summary for the Western Province covering all five PHI domains. Key focus areas include the ongoing dengue prevention programme and food safety inspection results during the festive season.',
    highlights: [
      '1,247 food premises inspected across Western Province',
      'Dengue breeding index reduced by 18% compared to December 2024',
      '23 new food premises registered and graded',
      '98% school health screening completion rate',
    ],
    stats: [
      { label: 'Inspections', value: '1,247' },
      { label: 'Complaints Resolved', value: '89' },
      { label: 'Dengue Cases', value: '34' },
      { label: 'Schools Screened', value: '156' },
    ],
    status: 'published',
  },
  {
    id: 'RPT-2025-002',
    title: 'Food Safety Inspection Results — Q4 2024',
    category: 'food',
    type: 'Quarterly Report',
    publishedDate: '2025-01-20',
    author: 'Amila Bandara',
    authorRole: 'Public Health Inspector',
    mohArea: 'Moratuwa MOH Area',
    summary: 'Fourth quarter food safety inspection summary covering 312 establishments in the Moratuwa PHI area. Overall compliance improved by 7% with targeted interventions for street food vendors.',
    highlights: [
      '312 food establishments inspected (93% coverage)',
      '89% achieved Grade A or B hygiene rating',
      '12 establishments issued improvement notices',
      'Street food vendor compliance improved from 62% to 78%',
    ],
    stats: [
      { label: 'Grade A', value: '187' },
      { label: 'Grade B', value: '91' },
      { label: 'Grade C', value: '34' },
      { label: 'Compliance', value: '89%' },
    ],
    status: 'published',
  },
  {
    id: 'RPT-2025-003',
    title: 'Dengue Surveillance Report — Colombo District (Week 4, 2025)',
    category: 'epidemiology',
    type: 'Weekly Epidemiology Report',
    publishedDate: '2025-01-27',
    author: 'Kumari Wijeratne',
    authorRole: 'Supervising PHI',
    mohArea: 'Colombo MOH Area',
    summary: 'Weekly dengue surveillance data for Colombo District. Cases decreased by 12% following enhanced vector control operations. Breteau Index remains above threshold in 3 GN divisions.',
    highlights: [
      '34 confirmed dengue cases (down from 39 previous week)',
      'Breteau Index above threshold in Borella, Maradana, Slave Island',
      '450 premises checked for breeding sites — 23 positive',
      'Fogging operations completed in 8 GN divisions',
    ],
    status: 'published',
  },
  {
    id: 'RPT-2025-004',
    title: 'Water Quality Monitoring Report — January 2025',
    category: 'environment',
    type: 'Monthly Report',
    publishedDate: '2025-02-02',
    author: 'Amila Bandara',
    authorRole: 'Public Health Inspector',
    mohArea: 'Moratuwa MOH Area',
    summary: 'Monthly water quality monitoring results for Kelani River basin and community water sources. 94% of tested sources met WHO drinking water guidelines.',
    highlights: [
      '156 water samples collected from community sources',
      '94% met WHO drinking water guidelines',
      'Chlorine residual adequate in 98% of piped water',
      '3 wells flagged for elevated coliform — remediation in progress',
    ],
    stats: [
      { label: 'Samples', value: '156' },
      { label: 'Compliant', value: '147' },
      { label: 'Flagged', value: '9' },
      { label: 'Pass Rate', value: '94%' },
    ],
    status: 'published',
  },
  {
    id: 'RPT-2025-005',
    title: 'Factory Health & Safety Quarterly Review — Q4 2024',
    category: 'occupational',
    type: 'Quarterly Report',
    publishedDate: '2025-01-15',
    author: 'Kumari Wijeratne',
    authorRole: 'Supervising PHI',
    mohArea: 'Colombo MOH Area',
    summary: '78 factories inspected with focus on garment industry worker health and ventilation standards. 92% compliance achieved.',
    highlights: [
      '78 factories inspected in Q4 2024',
      '92% compliance with ventilation standards',
      '340 workers received health screenings',
      '5 factories issued improvement notices for ergonomic hazards',
    ],
    stats: [
      { label: 'Factories', value: '78' },
      { label: 'Workers Screened', value: '340' },
      { label: 'Compliance', value: '92%' },
      { label: 'Notices Issued', value: '5' },
    ],
    status: 'published',
  },
  {
    id: 'RPT-2025-006',
    title: 'School Health Programme Annual Summary — 2024',
    category: 'monthly',
    type: 'Annual Report',
    publishedDate: '2025-01-10',
    author: 'Dr. Nimal Jayasinghe',
    authorRole: 'MOH Administrator',
    mohArea: 'Colombo MOH Area',
    summary: 'Annual summary of the school health programme covering medical inspections, dental screenings, BMI assessments, and immunization coverage — 45 schools, 12,340 students examined.',
    highlights: [
      '45 schools covered — 12,340 students examined',
      'BMI: 8% underweight, 12% overweight',
      'Dental caries prevalence: 34% (down from 41% in 2023)',
      'Deworming: 97% — HPV vaccination: 94%',
    ],
    stats: [
      { label: 'Schools', value: '45' },
      { label: 'Students', value: '12,340' },
      { label: 'Deworming', value: '97%' },
      { label: 'HPV Vaccine', value: '94%' },
    ],
    status: 'published',
  },
];

// Permits — queryable by permitId for /public/verify
const PERMITS = [
  {
    id: 'PRM-2025-001',
    permitId: 'FP-20250001',
    type: 'Food Premises Registration',
    holder: 'Golden Dragon Restaurant',
    address: '45 Main St, Colombo 07',
    issued: '2024-06-15',
    expires: '2025-06-14',
    grade: 'A',
    area: 'Colombo MOH Area',
    status: 'active',
    issuedBy: 'PHI Colombo North (K. Perera)',
  },
  {
    id: 'PRM-2025-002',
    permitId: 'FP-20250002',
    type: 'Food Premises Registration',
    holder: 'Fresh Bakery & Cafe',
    address: '12 Galle Rd, Dehiwala',
    issued: '2024-09-01',
    expires: '2025-08-31',
    grade: 'A',
    area: 'Dehiwala MOH Area',
    status: 'active',
    issuedBy: 'PHI Dehiwala (R. Fernando)',
  },
  {
    id: 'PRM-2025-003',
    permitId: 'FC-20250001',
    type: 'Factory Health Certificate',
    holder: 'Lanka Garments Ltd.',
    address: '50 Industrial Zone, Kaduwela',
    issued: '2024-07-20',
    expires: '2025-07-19',
    area: 'Kaduwela MOH Area',
    status: 'active',
    issuedBy: 'SPHI Kaduwela (Dr. N. Wickrama)',
  },
  {
    id: 'PRM-2025-004',
    permitId: 'FC-20250002',
    type: 'Factory Health Certificate',
    holder: 'Steel Works Co.',
    address: 'Industrial Estate, Homagama',
    issued: '2024-08-10',
    expires: '2025-08-09',
    area: 'Homagama MOH Area',
    status: 'active',
    issuedBy: 'PHI Homagama (A. Bandara)',
  },
  {
    id: 'PRM-2025-005',
    permitId: 'TL-20250001',
    type: 'Trade License Health Clearance',
    holder: 'ABC Processing Ltd.',
    address: '100 Factory Rd, Homagama',
    issued: '2024-01-15',
    expires: '2025-01-14',
    area: 'Homagama MOH Area',
    status: 'expired',
    issuedBy: 'PHI Homagama (A. Bandara)',
  },
  {
    id: 'PRM-2025-006',
    permitId: 'FP-20250006',
    type: 'Food Premises Registration',
    holder: 'Sunrise Hotel',
    address: '200 Beach Rd, Mt. Lavinia',
    issued: '2025-02-01',
    expires: '2026-01-31',
    grade: 'A',
    area: 'Dehiwala MOH Area',
    status: 'active',
    issuedBy: 'PHI Dehiwala (R. Fernando)',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   PHI-PRO Public Data Seed Script — v2.0               ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const now = new Date().toISOString();

  // ── Step 1: Authenticate as PHI officer (for food_grades, published_reports)
  console.log('➤ Authenticating as PHI officer…');
  try {
    await signInWithEmailAndPassword(auth, 'phi@phipro.health.gov.lk', 'PhiPro@Field2025');
    console.log('  ✓ Authenticated as PHI\n');
  } catch (err) {
    console.error('  ✗ PHI auth failed:', err.message);
    console.error('  → Run seed-users.mjs first to create demo accounts.');
    process.exit(1);
  }

  const phiUid = auth.currentUser.uid;

  // ── food_grades (PHI can create)
  console.log('➤ Seeding food_grades…');
  let ok = 0, fail = 0;
  for (const rec of FOOD_GRADES) {
    try {
      await setDoc(doc(db, 'food_grades', rec.id), { ...rec, createdBy: phiUid, createdAt: now, updatedAt: now });
      process.stdout.write('  ✓ ');
      ok++;
    } catch (e) {
      process.stdout.write(`  ✗ ${rec.id} (${e.message})\n`);
      fail++;
    }
  }
  console.log(`\n  → ${ok} written, ${fail} failed\n`);

  // ── published_reports (PHI can create)
  console.log('➤ Seeding published_reports…');
  ok = 0; fail = 0;
  for (const rec of PUBLISHED_REPORTS) {
    try {
      await setDoc(doc(db, 'published_reports', rec.id), { ...rec, createdBy: phiUid, createdAt: now, updatedAt: now });
      process.stdout.write('  ✓ ');
      ok++;
    } catch (e) {
      process.stdout.write(`  ✗ ${rec.id} (${e.message})\n`);
      fail++;
    }
  }
  console.log(`\n  → ${ok} written, ${fail} failed\n`);

  // ── Step 2: Re-auth as SPHI (for public_alerts)
  await signOut(auth);
  console.log('➤ Re-authenticating as SPHI…');
  try {
    await signInWithEmailAndPassword(auth, 'sphi@phipro.health.gov.lk', 'PhiPro@Sphi2025');
    console.log('  ✓ Authenticated as SPHI\n');
  } catch (e) {
    console.error('  ✗ SPHI auth failed:', e.message);
    process.exit(1);
  }

  const sphiUid = auth.currentUser.uid;

  // ── public_alerts (SPHI can create)
  console.log('➤ Seeding public_alerts…');
  ok = 0; fail = 0;
  for (const rec of PUBLIC_ALERTS) {
    try {
      await setDoc(doc(db, 'public_alerts', rec.id), { ...rec, createdBy: sphiUid, createdAt: now, updatedAt: now });
      process.stdout.write('  ✓ ');
      ok++;
    } catch (e) {
      process.stdout.write(`  ✗ ${rec.id} (${e.message})\n`);
      fail++;
    }
  }
  console.log(`\n  → ${ok} written, ${fail} failed\n`);

  // ── permits (SPHI can create)
  console.log('➤ Seeding permits…');
  ok = 0; fail = 0;
  for (const rec of PERMITS) {
    try {
      await setDoc(doc(db, 'permits', rec.id), { ...rec, createdBy: sphiUid, createdAt: now, updatedAt: now });
      process.stdout.write('  ✓ ');
      ok++;
    } catch (e) {
      process.stdout.write(`  ✗ ${rec.id} (${e.message})\n`);
      fail++;
    }
  }
  console.log(`\n  → ${ok} written, ${fail} failed\n`);

  await signOut(auth);

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  food_grades      : ${FOOD_GRADES.length} records`);
  console.log(`  published_reports: ${PUBLISHED_REPORTS.length} records`);
  console.log(`  public_alerts    : ${PUBLIC_ALERTS.length} records`);
  console.log(`  permits          : ${PERMITS.length} records`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n✓ All public data seeded. Deploy firestore.rules then run this script.\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('\n✗ Fatal error:', err);
  process.exit(1);
});

/**
 * PHI-PRO Public Content Seed Script
 * Seeds published_reports, food_grades, and public_alerts collections
 * in Firestore so the public portal has realistic data.
 *
 * Usage:  node scripts/seed-public-data.mjs
 *
 * Prerequisites: Run seed-users.mjs first to create the PHI user accounts.
 * This script authenticates as the PHI officer to comply with Firestore rules.
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
} from 'firebase/firestore';

// ── Firebase config ────────────────────────────────────────────────────────
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

// ── Published Reports ──────────────────────────────────────────────────────
const publishedReports = [
  {
    id: 'RPT-2025-001',
    title: 'Monthly Public Health Summary — Western Province (January 2025)',
    category: 'monthly',
    type: 'Monthly Report',
    publishedDate: '2025-02-05',
    author: 'Dr. Nimal Jayasinghe',
    authorRole: 'MOH_ADMIN',
    mohArea: 'Colombo MOH Area',
    summary: 'Comprehensive public health summary covering all five PHI domains.',
    highlights: [
      '1,247 food premises inspected across Western Province',
      'Dengue breeding index reduced by 18%',
      '23 new food premises registered',
      '98% school health screening completion rate',
    ],
    stats: { inspections: 1247, complaintsResolved: 89, dengueCases: 34, schoolsScreened: 156 },
    status: 'published',
  },
  {
    id: 'RPT-2025-002',
    title: 'Food Safety Inspection Results — Q4 2024',
    category: 'food',
    type: 'Quarterly Report',
    publishedDate: '2025-01-20',
    author: 'Amila Bandara',
    authorRole: 'PHI',
    mohArea: 'Moratuwa MOH Area',
    summary: '312 establishments inspected in Q4. Compliance improved 7%.',
    highlights: [
      '312 food establishments inspected (93% coverage)',
      '89% achieved Grade A or B hygiene rating',
      '12 establishments issued improvement notices',
    ],
    stats: { gradeA: 187, gradeB: 91, gradeC: 34, complianceRate: 89 },
    status: 'published',
  },
  {
    id: 'RPT-2025-003',
    title: 'Dengue Surveillance Report — Colombo District (Week 4, 2025)',
    category: 'epidemiology',
    type: 'Weekly Epidemiology Report',
    publishedDate: '2025-01-27',
    author: 'Kumari Wijeratne',
    authorRole: 'SPHI',
    mohArea: 'Colombo MOH Area',
    summary: 'Cases decreased by 12% following enhanced vector control.',
    highlights: [
      '34 confirmed dengue cases (down from 39)',
      'Breteau Index above threshold in 3 GN divisions',
      '450 premises checked, 23 breeding sites found',
    ],
    stats: { confirmedCases: 34, premisesChecked: 450, breedingSites: 23, foggingOps: 8 },
    status: 'published',
  },
];

// ── Food Grades ────────────────────────────────────────────────────────────
const foodGrades = [
  { id: 'FG-001', name: 'Golden Dragon Restaurant', address: '45 Main St, Colombo 07', grade: 'A', score: 92, lastInspection: '2025-01-15', type: 'Restaurant', registrationNo: 'FP-20240156', mohArea: 'Colombo MOH Area' },
  { id: 'FG-002', name: 'Fresh Bakery & Cafe', address: '12 Galle Rd, Dehiwala', grade: 'A', score: 88, lastInspection: '2025-01-10', type: 'Bakery', registrationNo: 'FP-20240234', mohArea: 'Dehiwala MOH Area' },
  { id: 'FG-003', name: 'City Food Court', address: '78 Kandy Rd, Kaduwela', grade: 'B', score: 72, lastInspection: '2024-12-20', type: 'Food Court', registrationNo: 'FP-20240089', mohArea: 'Kaduwela MOH Area' },
  { id: 'FG-004', name: 'Sunrise Hotel', address: '200 Beach Rd, Mt. Lavinia', grade: 'A', score: 95, lastInspection: '2025-02-01', type: 'Hotel', registrationNo: 'FP-20240312', mohArea: 'Dehiwala MOH Area' },
  { id: 'FG-005', name: 'Corner Deli', address: '5 Temple Rd, Nugegoda', grade: 'C', score: 48, lastInspection: '2024-11-25', type: 'Retail', registrationNo: 'FP-20230567', mohArea: 'Colombo MOH Area' },
  { id: 'FG-006', name: 'Highway Rest Stop', address: 'A1 Highway, Kottawa', grade: 'B', score: 65, lastInspection: '2024-12-15', type: 'Restaurant', registrationNo: 'FP-20240178', mohArea: 'Homagama MOH Area' },
  { id: 'FG-007', name: 'Royal Colombo Cafe', address: '134 Duplication Rd, Colombo 03', grade: 'A', score: 91, lastInspection: '2025-01-22', type: 'Restaurant', registrationNo: 'FP-20240445', mohArea: 'Colombo MOH Area' },
  { id: 'FG-008', name: 'Mango Tree Eatery', address: '78 High Level Rd, Maharagama', grade: 'B', score: 71, lastInspection: '2025-01-05', type: 'Restaurant', registrationNo: 'FP-20240201', mohArea: 'Maharagama MOH Area' },
];

// ── Public Alerts ──────────────────────────────────────────────────────────
const publicAlerts = [
  { id: 'ALT-001', title: 'Dengue Outbreak Alert — Western Province', severity: 'critical', body: 'Increased dengue cases. Eliminate stagnant water, use mosquito nets.', area: 'Western Province', publishedDate: '2025-02-10', active: true },
  { id: 'ALT-002', title: 'Leptospirosis Risk — Post-Flood Advisory', severity: 'warning', body: 'Avoid contact with flood water. Wear protective footwear.', area: 'Sabaragamuwa', publishedDate: '2025-02-08', active: true },
  { id: 'ALT-003', title: 'Water Quality Advisory — Kelani River Basin', severity: 'info', body: 'Boil water before consumption if sourced from river.', area: 'Colombo / Gampaha', publishedDate: '2025-02-05', active: true },
  { id: 'ALT-004', title: 'HPV Vaccination Campaign — Schools', severity: 'info', body: 'Grade 6 girls vaccination programme ongoing.', area: 'Nationwide', publishedDate: '2025-01-28', active: true },
  { id: 'ALT-005', title: 'Food Recall — Contaminated Canned Fish', severity: 'warning', body: 'Batch XYZ-2025-001 recalled. Do not consume.', area: 'Nationwide', publishedDate: '2025-01-20', active: true },
];

// ── Seed Function ──────────────────────────────────────────────────────────
async function seedPublicData() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║    PHI-PRO Public Data Seed Script — v1.0.0                 ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Authenticate as PHI officer (needed for Firestore rules)
  console.log('➤ Authenticating as PHI officer...');
  try {
    await signInWithEmailAndPassword(auth, 'phi@phipro.health.gov.lk', 'PhiPro@Field2025');
    console.log('  ✓ Authenticated\n');
  } catch (err) {
    console.error('  ✗ Auth failed. Run seed-users.mjs first:', err.message);
    process.exit(1);
  }

  const uid = auth.currentUser.uid;
  const now = new Date().toISOString();

  // Seed published_reports
  console.log('➤ Seeding published_reports...');
  for (const report of publishedReports) {
    try {
      await setDoc(doc(db, 'published_reports', report.id), {
        ...report,
        createdBy: uid,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`  ✓ ${report.id}: ${report.title.slice(0, 50)}...`);
    } catch (err) {
      console.error(`  ✗ ${report.id}: ${err.message}`);
    }
  }

  // Seed food_grades
  console.log('\n➤ Seeding food_grades...');
  for (const grade of foodGrades) {
    try {
      await setDoc(doc(db, 'food_grades', grade.id), {
        ...grade,
        createdBy: uid,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`  ✓ ${grade.id}: ${grade.name}`);
    } catch (err) {
      console.error(`  ✗ ${grade.id}: ${err.message}`);
    }
  }

  // Seed public_alerts — requires SPHI or MOH_ADMIN role
  await signOut(auth);
  console.log('\n➤ Re-authenticating as SPHI for public_alerts...');
  try {
    await signInWithEmailAndPassword(auth, 'sphi@phipro.health.gov.lk', 'PhiPro@Sphi2025');
    console.log('  ✓ Authenticated as SPHI\n');
  } catch (err) {
    console.error('  ✗ SPHI auth failed:', err.message);
  }

  const sphiUid = auth.currentUser ? auth.currentUser.uid : uid;
  const alertNow = new Date().toISOString();

  console.log('➤ Seeding public_alerts...');
  for (const alert of publicAlerts) {
    try {
      await setDoc(doc(db, 'public_alerts', alert.id), {
        ...alert,
        createdBy: sphiUid,
        createdAt: alertNow,
        updatedAt: alertNow,
      });
      console.log(`  ✓ ${alert.id}: ${alert.title.slice(0, 50)}...`);
    } catch (err) {
      console.error(`  ✗ ${alert.id}: ${err.message}`);
    }
  }

  await signOut(auth);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  ✓ Seeded ${publishedReports.length} published reports`);
  console.log(`  ✓ Seeded ${foodGrades.length} food grades`);
  console.log(`  ✓ Seeded ${publicAlerts.length} public alerts`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✓ Public data seeded successfully.');
  process.exit(0);
}

seedPublicData().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

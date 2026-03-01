/**
 * PHI-PRO User Seed Script
 * Creates professional demo accounts for all 4 user roles
 * using the Firebase Client SDK.
 *
 * Usage:  node scripts/seed-users.mjs
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

// ── Firebase config (matches apps/web/.env.local) ──────────────────────────
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

// ── Users to create ────────────────────────────────────────────────────────
const users = [
  {
    email: 'admin@phipro.health.gov.lk',
    password: 'PhiPro@Admin2025',
    displayName: 'Dr. Nimal Jayasinghe',
    role: 'MOH_ADMIN',
    nameInSinhala: 'ආචාර්ය නිමල් ජයසිංහ',
    mohAreaId: 'MOH-COLOMBO-01',
    domains: [
      'FOOD_SAFETY',
      'SCHOOL_HEALTH',
      'EPIDEMIOLOGY',
      'OCCUPATIONAL_HEALTH',
      'ADMINISTRATION',
    ],
  },
  {
    email: 'sphi@phipro.health.gov.lk',
    password: 'PhiPro@Sphi2025',
    displayName: 'Kumari Wijeratne',
    role: 'SPHI',
    nameInSinhala: 'කුමාරි විජේරත්න',
    assignedPHIAreas: ['PHI-MORATUWA-01', 'PHI-MORATUWA-02', 'PHI-DEHIWALA-01'],
    domains: [
      'FOOD_SAFETY',
      'SCHOOL_HEALTH',
      'EPIDEMIOLOGY',
      'OCCUPATIONAL_HEALTH',
      'ADMINISTRATION',
    ],
  },
  {
    email: 'phi@phipro.health.gov.lk',
    password: 'PhiPro@Field2025',
    displayName: 'Amila Bandara',
    role: 'PHI',
    nameInSinhala: 'අමිල බන්දාර',
    phiArea: {
      phiAreaId: 'PHI-MORATUWA-01',
      phiAreaName: 'Moratuwa West',
      mohAreaId: 'MOH-COLOMBO-01',
      gnDivisions: ['547A', '547B', '547C', '548', '549'],
      assignedPhiId: '',
      supervisingPhiId: '',
    },
    domains: [
      'FOOD_SAFETY',
      'SCHOOL_HEALTH',
      'EPIDEMIOLOGY',
      'OCCUPATIONAL_HEALTH',
      'ADMINISTRATION',
    ],
  },
  {
    email: 'citizen@phipro.health.gov.lk',
    password: 'PhiPro@Public2025',
    displayName: 'Sanduni Perera',
    role: 'PUBLIC',
    nameInSinhala: 'සඳුනි පෙරේරා',
    domains: [],
  },
];

// ── Seed function ──────────────────────────────────────────────────────────
async function seedUsers() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        PHI-PRO User Seed Script — v1.1.0                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  for (const u of users) {
    try {
      console.log(`➤ Creating ${u.role} → ${u.email} ...`);

      // 1. Create Firebase Auth account
      const cred = await createUserWithEmailAndPassword(auth, u.email, u.password);
      const uid = cred.user.uid;
      console.log(`  ✓ Auth account created (UID: ${uid})`);

      // 2. Create Firestore profile at users/{uid}
      const now = new Date().toISOString();
      const profile = {
        uid,
        email: u.email,
        displayName: u.displayName,
        nameInSinhala: u.nameInSinhala || '',
        role: u.role,
        status: 'ACTIVE', // All demo accounts set to ACTIVE
        preferredLanguage: 'EN',
        domains: u.domains || [],
        createdAt: now,
        updatedAt: now,
        createdBy: uid,
        lastLoginAt: now,
      };

      // Add role-specific fields
      if (u.phiArea) profile.phiArea = u.phiArea;
      if (u.assignedPHIAreas) profile.assignedPHIAreas = u.assignedPHIAreas;
      if (u.mohAreaId) profile.mohAreaId = u.mohAreaId;

      await setDoc(doc(db, 'users', uid), profile);
      console.log(`  ✓ Firestore profile created`);

      // Sign out so we can create the next user
      await signOut(auth);
      console.log(`  ✓ Done\n`);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        console.log(`  ⚠ Account already exists — skipping\n`);
        await signOut(auth).catch(() => {});
      } else {
        console.error(`  ✗ Error: ${err.message}\n`);
        await signOut(auth).catch(() => {});
      }
    }
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  DEMO CREDENTIALS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  Role          Email                            Password');
  console.log('  ────────────  ───────────────────────────────  ──────────────────');
  for (const u of users) {
    const role = u.role.padEnd(12);
    const email = u.email.padEnd(33);
    console.log(`  ${role}  ${email}  ${u.password}`);
  }
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✓ All users seeded successfully. You can now log in at http://localhost:3000/login');
  process.exit(0);
}

seedUsers().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

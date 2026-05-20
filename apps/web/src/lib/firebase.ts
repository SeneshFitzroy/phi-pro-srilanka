import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  getToken as getAppCheckToken,
} from 'firebase/app-check';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

// Initialize Firebase (prevent double init in dev HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ── Firebase App Check (ReCaptchaV3) ─────────────────────────────────────
// Protects Firestore and Auth from abuse/unauthorized API calls.
// In dev: uses debug token from NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN.
// In prod: uses reCAPTCHA v3 site key.
let appCheck: ReturnType<typeof initializeAppCheck> | null = null;

if (typeof window !== 'undefined') {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const debugToken = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN;
  // App Check is OPT-IN. It only does anything useful once the reCAPTCHA v3
  // site key has been whitelisted for the live domain in the Firebase
  // console. Until then Google returns 403 and throttles for 24h, which
  // floods the console with errors on every page. So we keep it OFF unless
  // NEXT_PUBLIC_ENABLE_APPCHECK is explicitly set to 'true'. Firestore + Auth
  // work fine without it; flip the flag on once the key is whitelisted.
  const appCheckEnabled = process.env.NEXT_PUBLIC_ENABLE_APPCHECK === 'true';

  // Enable debug token in development
  if (debugToken && process.env.NODE_ENV !== 'production') {
    // @ts-expect-error — global debug token for App Check
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
  }

  if (appCheckEnabled && recaptchaSiteKey) {
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (err) {
      console.warn('[firebase] App Check init failed (non-fatal):', err);
    }
  }
}

export { app, auth, db, storage, appCheck, getAppCheckToken };

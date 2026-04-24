// ============================================================================
// PHI-PRO AES-256-GCM Field-Level Encryption
// Used for: H1046 student health records, personal health data (GDPR/PDPA)
// Algorithm: AES-256-GCM (authenticated encryption, tamper-proof)
// Key derivation: PBKDF2 with SHA-256, 310,000 iterations (NIST SP 800-132)
// ============================================================================

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH_BITS = 256;
const IV_LENGTH_BYTES = 12;   // GCM standard
const SALT_LENGTH_BYTES = 16;
const PBKDF2_ITERATIONS = 310_000;
const PBKDF2_HASH = 'SHA-256';

// The encryption secret is derived from the Firebase project ID + user UID
// so that each user's data is encrypted with a unique derived key.
// Store only the encrypted ciphertext in Firestore — never the raw key.

// ---------------------------------------------------------------------------
// Key derivation
// ---------------------------------------------------------------------------

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password).buffer as ArrayBuffer,
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: PBKDF2_HASH,
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH_BITS },
    false,
    ['encrypt', 'decrypt'],
  );
}

function buildPassword(userId: string, projectId: string): string {
  // Deterministic — same userId + projectId always yields same key
  return `phi-pro:${projectId}:${userId}:phi1046`;
}

// ---------------------------------------------------------------------------
// Encrypt a plaintext string
// Returns: base64( salt || iv || ciphertext ) — self-contained envelope
// ---------------------------------------------------------------------------

export async function encryptField(
  plaintext: string,
  userId: string,
  projectId: string = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'phi-pro',
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));
  const key = await deriveKey(buildPassword(userId, projectId), salt);

  const encoder = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext),
  );

  // Pack: [salt (16)] + [iv (12)] + [ciphertext (variable)]
  const packed = new Uint8Array(SALT_LENGTH_BYTES + IV_LENGTH_BYTES + ciphertext.byteLength);
  packed.set(salt, 0);
  packed.set(iv, SALT_LENGTH_BYTES);
  packed.set(new Uint8Array(ciphertext), SALT_LENGTH_BYTES + IV_LENGTH_BYTES);

  // Return as base64
  return btoa(String.fromCharCode(...packed));
}

// ---------------------------------------------------------------------------
// Decrypt a ciphertext envelope
// ---------------------------------------------------------------------------

export async function decryptField(
  envelope: string,
  userId: string,
  projectId: string = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'phi-pro',
): Promise<string> {
  const packed = Uint8Array.from(atob(envelope), (c) => c.charCodeAt(0));

  const salt = packed.slice(0, SALT_LENGTH_BYTES);
  const iv = packed.slice(SALT_LENGTH_BYTES, SALT_LENGTH_BYTES + IV_LENGTH_BYTES);
  const ciphertext = packed.slice(SALT_LENGTH_BYTES + IV_LENGTH_BYTES);

  const key = await deriveKey(buildPassword(userId, projectId), salt);

  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext,
  );

  return new TextDecoder().decode(plaintext);
}

// ---------------------------------------------------------------------------
// Convenience: encrypt multiple fields at once (e.g., H1046 health record)
// ---------------------------------------------------------------------------

export type SensitiveFields = Record<string, string>;

export async function encryptSensitiveFields(
  fields: SensitiveFields,
  userId: string,
): Promise<SensitiveFields> {
  const encrypted: SensitiveFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value && typeof value === 'string') {
      encrypted[key] = await encryptField(value, userId);
    }
  }
  return encrypted;
}

export async function decryptSensitiveFields(
  fields: SensitiveFields,
  userId: string,
): Promise<SensitiveFields> {
  const decrypted: SensitiveFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value && typeof value === 'string') {
      try {
        decrypted[key] = await decryptField(value, userId);
      } catch {
        decrypted[key] = '[Decryption failed]';
      }
    }
  }
  return decrypted;
}

// ---------------------------------------------------------------------------
// H1046-specific sensitive field list
// ---------------------------------------------------------------------------

export const H1046_SENSITIVE_FIELDS: readonly string[] = [
  'studentNic',
  'parentNic',
  'diagnosis',
  'medicalHistory',
  'vaccinationRecord',
  'bmi',
  'bloodPressure',
  'visionTest',
  'hearingTest',
  'dentalNotes',
  'mentalHealthNotes',
] as const;

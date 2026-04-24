// ============================================================================
// PHI-PRO WebAuthn / FIDO2 Passkey Authentication
// Standard: W3C Web Authentication Level 2 (WebAuthn)
// Enables: device biometrics (fingerprint, Face ID) for PHI login
// ============================================================================

const RP_NAME = 'PHI-PRO Health Enforcement System';
const RP_ID = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

// ---------------------------------------------------------------------------
// Check browser support
// ---------------------------------------------------------------------------

export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.PublicKeyCredential &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  );
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
}

// ---------------------------------------------------------------------------
// Credential registration (Passkey enrollment)
// Called once when a PHI officer sets up biometric login
// ---------------------------------------------------------------------------

export interface WebAuthnRegistrationResult {
  credentialId: string;     // base64url — stored server-side
  publicKey: string;        // base64url COSE key
  transports: string[];
  userHandle: string;       // userId base64url
}

export async function registerPasskey(
  userId: string,
  userDisplayName: string,
  userEmail: string,
): Promise<WebAuthnRegistrationResult> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userIdBytes = new TextEncoder().encode(userId);

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: challenge.buffer as ArrayBuffer,
      rp: { name: RP_NAME, id: RP_ID },
      user: {
        id: userIdBytes.buffer as ArrayBuffer,
        name: userEmail,
        displayName: userDisplayName,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },   // ES256 (ECDSA w/ SHA-256)
        { type: 'public-key', alg: -257 },  // RS256 (RSA-PKCS1-SHA256)
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',  // device-bound (biometric)
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60_000,
      attestation: 'none',  // no attestation needed for privacy
    },
  }) as PublicKeyCredential;

  if (!credential) throw new Error('Passkey registration cancelled');

  const response = credential.response as AuthenticatorAttestationResponse;
  const credentialId = bufferToBase64url(credential.rawId);
  const publicKey = bufferToBase64url(response.getPublicKey()!);
  const transports = response.getTransports?.() ?? [];

  return {
    credentialId,
    publicKey,
    transports,
    userHandle: bufferToBase64url(userIdBytes.buffer as ArrayBuffer),
  };
}

// ---------------------------------------------------------------------------
// Authentication (Passkey challenge-response)
// Called on login — verifies biometric matches registered credential
// ---------------------------------------------------------------------------

export interface WebAuthnAuthResult {
  credentialId: string;
  authenticatorData: string;
  clientDataJSON: string;
  signature: string;
  userHandle: string | null;
}

export async function authenticateWithPasskey(
  allowedCredentialIds: string[] = [],
): Promise<WebAuthnAuthResult> {
  const challengeBytes = crypto.getRandomValues(new Uint8Array(32));

  const allowCredentials: PublicKeyCredentialDescriptor[] = allowedCredentialIds.map((id) => ({
    type: 'public-key',
    id: base64urlToBuffer(id),
    transports: ['internal'] as AuthenticatorTransport[],
  }));

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: challengeBytes.buffer as ArrayBuffer,
      rpId: RP_ID,
      allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
      userVerification: 'required',
      timeout: 60_000,
    },
  }) as PublicKeyCredential;

  if (!assertion) throw new Error('Passkey authentication cancelled');

  const response = assertion.response as AuthenticatorAssertionResponse;

  return {
    credentialId: bufferToBase64url(assertion.rawId),
    authenticatorData: bufferToBase64url(response.authenticatorData),
    clientDataJSON: bufferToBase64url(response.clientDataJSON),
    signature: bufferToBase64url(response.signature),
    userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null,
  };
}

// ---------------------------------------------------------------------------
// Passkey storage in IndexedDB (credential IDs per user)
// ---------------------------------------------------------------------------

const PASSKEY_STORE = 'phi-pro-passkeys';

export async function storePasskeyCredential(userId: string, credentialId: string): Promise<void> {
  const existing = getStoredCredentialIds(userId);
  if (!existing.includes(credentialId)) {
    const updated = [...existing, credentialId];
    localStorage.setItem(`${PASSKEY_STORE}:${userId}`, JSON.stringify(updated));
  }
}

export function getStoredCredentialIds(userId: string): string[] {
  try {
    const stored = localStorage.getItem(`${PASSKEY_STORE}:${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearPasskeyCredentials(userId: string): void {
  localStorage.removeItem(`${PASSKEY_STORE}:${userId}`);
}

// ---------------------------------------------------------------------------
// Base64url utilities (no external deps)
// ---------------------------------------------------------------------------

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

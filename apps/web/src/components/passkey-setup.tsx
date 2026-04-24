'use client';

// ============================================================================
// PasskeySetup — UI for WebAuthn/FIDO2 passkey enrollment
// Shows in: Dashboard > Settings > Security
// ============================================================================

import { useState, useEffect } from 'react';
import { Fingerprint, ShieldCheck, Trash2, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  registerPasskey,
  storePasskeyCredential,
  getStoredCredentialIds,
  clearPasskeyCredentials,
} from '@/lib/webauthn';

export function PasskeySetup() {
  const { user } = useAuth();
  const [supported, setSupported] = useState(false);
  const [available, setAvailable] = useState(false);
  const [credentialIds, setCredentialIds] = useState<string[]>([]);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    setSupported(isWebAuthnSupported());
    isPlatformAuthenticatorAvailable().then(setAvailable);
    if (user?.uid) setCredentialIds(getStoredCredentialIds(user.uid));
  }, [user?.uid]);

  const handleRegister = async () => {
    if (!user) return;
    setRegistering(true);
    try {
      const result = await registerPasskey(
        user.uid,
        user.displayName ?? 'PHI Officer',
        user.email ?? '',
      );
      await storePasskeyCredential(user.uid, result.credentialId);
      setCredentialIds(getStoredCredentialIds(user.uid));
      toast.success('Passkey registered — you can now sign in with biometrics');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      if (msg.includes('cancel')) {
        toast.info('Passkey registration cancelled');
      } else {
        toast.error(`Passkey error: ${msg}`);
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleClear = () => {
    if (!user) return;
    clearPasskeyCredentials(user.uid);
    setCredentialIds([]);
    toast.success('All passkeys removed');
  };

  if (!supported) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <XCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-muted-foreground">
            WebAuthn is not supported in this browser. Use Chrome, Safari, or Edge on a modern device.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Fingerprint className="h-5 w-5 text-[#0066cc]" />
          Passkey / Biometric Login (FIDO2 / WebAuthn)
          {credentialIds.length > 0 && (
            <span className="ml-auto flex items-center gap-1 text-xs font-normal text-green-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> Active
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!available && (
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
            No platform authenticator detected on this device. Connect a fingerprint reader or use a
            device with Face ID / Touch ID.
          </p>
        )}

        <p className="text-sm text-muted-foreground">
          Enable sign-in with your device&apos;s fingerprint, Face ID, or PIN. No password required.
          Your biometric data never leaves your device (FIDO2 standard).
        </p>

        {credentialIds.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600">Registered Passkeys</p>
            {credentialIds.map((id, i) => (
              <div
                key={id}
                className="flex items-center justify-between rounded-lg border bg-slate-50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-mono text-slate-600">
                    Passkey {i + 1} — {id.slice(0, 12)}…
                  </span>
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegister}
                disabled={registering || !available}
                className="gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Another
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="gap-1 text-red-600 hover:border-red-300 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove All
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleRegister}
            disabled={registering || !available}
            className="gap-2 bg-[#0066cc] hover:bg-[#0055aa] text-white"
          >
            <Fingerprint className="h-4 w-4" />
            {registering ? 'Follow device prompt…' : 'Set Up Passkey'}
          </Button>
        )}

        <p className="text-[10px] text-slate-400">
          FIDO2 / WebAuthn Level 2 · Credential ID stored locally · Biometrics never leave device
        </p>
      </CardContent>
    </Card>
  );
}

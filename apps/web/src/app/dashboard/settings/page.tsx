'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings as SettingsIcon, Globe, Moon, Sun, Bell, Database, Save, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PasskeySetup } from '@/components/passkey-setup';
import { SyncStatusBadge } from '@/components/sync-status-badge';
import { useSync } from '@/contexts/sync-context';
import { useLanguage } from '@/contexts/i18n-context';
import { toast } from 'sonner';

const THEME_KEY  = 'phi-pro-theme';
const NOTIFY_KEY = 'phi-pro-notify';
const GT_KEY     = 'phi-pro-gt-lang';

function applyTheme(theme: string) {
  const root = document.documentElement;
  const wantDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', wantDark);
}

function applyGoogleTranslate(target: 'en' | 'si' | 'ta') {
  // Mirrors LangPicker3 — set cookie + sessionStorage + reload to keep the
  // Google Translate banner state in sync with i18n.
  try {
    if (target === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      try { document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`; } catch { /* */ }
    } else {
      document.cookie = `googtrans=/auto/${target}; path=/`;
      try { document.cookie = `googtrans=/auto/${target}; path=/; domain=${window.location.hostname}`; } catch { /* */ }
    }
    localStorage.setItem(GT_KEY, target);
  } catch { /* ignore */ }
}

export default function SettingsPage() {
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const { isOnline, pendingCount, failedCount, triggerSync } = useSync();
  const { setLanguage } = useLanguage();
  const [notifications, setNotifications] = useState({ email: true, push: true, sms: false });

  /* Hydrate from localStorage on mount + apply theme/lang to the document */
  useEffect(() => {
    try {
      const savedTheme = (localStorage.getItem(THEME_KEY) as 'light' | 'dark' | 'system' | null) ?? 'system';
      setTheme(savedTheme);
      applyTheme(savedTheme);

      const savedLang = localStorage.getItem('i18nextLng') ?? 'en';
      if (['en', 'si', 'ta'].includes(savedLang)) setLang(savedLang);

      const savedNotify = localStorage.getItem(NOTIFY_KEY);
      if (savedNotify) setNotifications(JSON.parse(savedNotify));
    } catch { /* ignore */ }

    // React to OS-level dark mode flips when theme is 'system'
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const t = (localStorage.getItem(THEME_KEY) as 'light' | 'dark' | 'system' | null) ?? 'system';
      if (t === 'system') applyTheme('system');
    };
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);

  /* Apply + persist on each change so the user sees immediate feedback.
     Google Translate only kicks in after a page reload (it injects its DOM
     observers at boot), so we apply i18n in-place AND schedule a soft
     reload — that gives the user the snappy in-place i18n change AND the
     full Google Translate pass on the next paint. */
  const onPickLang = (next: string) => {
    setLang(next);
    setLanguage(next);
    if (next === 'en' || next === 'si' || next === 'ta') applyGoogleTranslate(next);
    toast.success(`Language set to ${next.toUpperCase()} — reloading…`);
    setTimeout(() => window.location.reload(), 350);
  };

  const onPickTheme = (next: 'light' | 'dark' | 'system') => {
    setTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch { /* */ }
    applyTheme(next);
  };

  const onToggleNotify = (key: 'email' | 'push' | 'sms') => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(NOTIFY_KEY, JSON.stringify(next)); } catch { /* */ }
      // For push notifications: actually ask for permission
      if (key === 'push' && next.push && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
      return next;
    });
  };

  const clearCache = async () => {
    try {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
      try { sessionStorage.clear(); } catch { /* */ }
      toast.success('Cache cleared.');
    } catch {
      toast.error('Could not clear cache.');
    }
  };

  const exportData = () => {
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        i18nextLng: localStorage.getItem('i18nextLng'),
        theme: localStorage.getItem(THEME_KEY),
        notifications: localStorage.getItem(NOTIFY_KEY),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phi-pro-settings-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not export data.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><SettingsIcon className="h-6 w-6" />Settings</h1>
          <p className="text-sm text-muted-foreground">Configure application preferences</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Language */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" />Language / භාෂාව / மொழி</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { code: 'en', label: 'English', native: 'English' },
              { code: 'si', label: 'Sinhala', native: 'සිංහල' },
              { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
            ].map(l => (
              <label key={l.code} className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${lang === l.code ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                <input type="radio" name="lang" value={l.code} checked={lang === l.code} onChange={() => onPickLang(l.code)} className="h-4 w-4" />
                <div><p className="text-sm font-medium">{l.label}</p><p className="text-xs text-muted-foreground">{l.native}</p></div>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2">{theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { code: 'light', label: 'Light', icon: Sun },
              { code: 'dark', label: 'Dark', icon: Moon },
              { code: 'system', label: 'System Default', icon: SettingsIcon },
            ].map(t => (
              <label key={t.code} className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${theme === t.code ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                <input type="radio" name="theme" value={t.code} checked={theme === t.code} onChange={() => onPickTheme(t.code as 'light' | 'dark' | 'system')} className="h-4 w-4" />
                <t.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{t.label}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" />Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: 'email' as const, label: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'push' as const, label: 'Push Notifications', desc: 'Browser push notifications' },
              { key: 'sms' as const, label: 'SMS Alerts', desc: 'Critical alerts via SMS' },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="text-sm font-medium">{n.label}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div>
                <button
                  onClick={() => onToggleNotify(n.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${notifications[n.key] ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${notifications[n.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Data & Storage */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4" />Data & Storage</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><p className="text-sm font-medium">Offline Storage</p><p className="text-xs text-muted-foreground">Cache data for offline use</p></div>
              <span className="text-xs text-muted-foreground">12.4 MB used</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><p className="text-sm font-medium">Auto-sync</p><p className="text-xs text-muted-foreground">Sync when connection restored</p></div>
              <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Enabled</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={clearCache}>Clear Cache</Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={exportData}>Export My Data</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security — Passkeys */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Shield className="h-4 w-4" /> Security — Passkeys / Biometrics
        </h2>
        <PasskeySetup />
      </div>

      {/* Sync status detail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" /> Sync Status
            <SyncStatusBadge className="ml-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            {isOnline ? 'Connected' : 'Offline'} · {pendingCount} pending · {failedCount} failed
          </p>
          {isOnline && (pendingCount > 0 || failedCount > 0) && (
            <Button variant="outline" size="sm" onClick={() => triggerSync()}>
              Sync Now
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          className="bg-[#0066cc] hover:bg-[#0055aa] text-white"
          onClick={() => {
            // Each setting is already applied immediately on change; this
            // button just gives the user a 'commit' moment + reloads so the
            // Google Translate banner reflects the chosen language across
            // every page.
            setLanguage(lang);
            toast.success('Settings saved.');
            setTimeout(() => window.location.reload(), 400);
          }}
        >
          <Save className="mr-2 h-4 w-4" />Save Settings
        </Button>
      </div>
    </div>
  );
}
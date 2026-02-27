'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings as SettingsIcon, Globe, Moon, Sun, Bell, Shield, Database, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('system');
  const [notifications, setNotifications] = useState({ email: true, push: true, sms: false });

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
                <input type="radio" name="lang" value={l.code} checked={lang === l.code} onChange={() => setLang(l.code)} className="h-4 w-4" />
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
                <input type="radio" name="theme" value={t.code} checked={theme === t.code} onChange={() => setTheme(t.code)} className="h-4 w-4" />
                <t.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{t.label}</span>
              </label>
            ))}
          </CardContent>
        </Card>

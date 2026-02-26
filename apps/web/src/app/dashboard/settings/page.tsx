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
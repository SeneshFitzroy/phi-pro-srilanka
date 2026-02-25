'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Phone, MapPin, Camera, Save, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-sm text-muted-foreground">View and update your account information</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:row-span-2">
          <CardContent className="flex flex-col items-center p-6 space-y-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-12 w-12 text-primary/60" />
              </div>
              <Button variant="outline" size="icon" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"><Camera className="h-4 w-4" /></Button>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold">K. Perera</h2>
              <p className="text-sm text-muted-foreground">Public Health Inspector</p>
              <span className="mt-1 inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-700">Active</span>
            </div>
            <div className="w-full space-y-2 pt-4 border-t text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />k.perera@health.gov.lk</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />071-1234567</div>
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />Colombo North PHI Area</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Shield className="h-4 w-4" />Role: PHI Officer</div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Full Name</Label><Input defaultValue="K. Perera" /></div>
              <div className="space-y-2"><Label>NIC Number</Label><Input defaultValue="199012345V" /></div>
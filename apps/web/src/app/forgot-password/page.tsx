'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 space-y-6">
          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h1 className="text-xl font-bold">Check Your Email</h1>
              <p className="text-sm text-muted-foreground">We&apos;ve sent a password reset link to <strong>{email}</strong>. Check your inbox (and spam folder).</p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={() => setSent(false)}>Try Another Email</Button>
                <Link href="/login"><Button className="w-full">Back to Login</Button></Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <Lock className="h-12 w-12 text-primary mx-auto mb-3" />
                <h1 className="text-xl font-bold">Forgot Password?</h1>
                <p className="text-sm text-muted-foreground mt-1">Enter your email to receive a password reset link</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Send Reset Link
                </Button>
              </form>
              <div className="text-center">
                <Link href="/login" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                  <ArrowLeft className="h-4 w-4" /> Back to Login
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Users, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WorkerRecord {
  id: number;
  name: string;
  age: string;
  gender: string;
  section: string;
  yearsEmployed: string;
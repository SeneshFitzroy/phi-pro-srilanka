import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  Search,
  MessageSquare,
  AlertTriangle,
  CreditCard,
  CheckCircle,
  Shield,
  ArrowRight,
} from 'lucide-react';

export default function PublicPortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
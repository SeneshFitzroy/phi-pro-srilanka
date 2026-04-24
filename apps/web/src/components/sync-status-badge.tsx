'use client';

// ============================================================================
// SyncStatusBadge — Real-time offline/online sync indicator
// Shows: "Synced", "Syncing…", "3 Pending", "2 Failed", "Offline Mode"
// ============================================================================

import { useSync } from '@/contexts/sync-context';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyncStatusBadgeProps {
  className?: string;
  compact?: boolean;
}

export function SyncStatusBadge({ className, compact = false }: SyncStatusBadgeProps) {
  const { isOnline, syncStatus, pendingCount, failedCount, triggerSync, lastSyncedAt } =
    useSync();

  const config = {
    SYNCED: {
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: 'Synced',
      classes: 'bg-green-100 text-green-700 border-green-200',
    },
    SYNCING: {
      icon: <RefreshCw className="h-3.5 w-3.5 animate-spin" />,
      label: 'Syncing…',
      classes: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    PENDING: {
      icon: <Clock className="h-3.5 w-3.5" />,
      label: compact ? `${pendingCount}` : `${pendingCount} Pending`,
      classes: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    FAILED: {
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      label: compact ? `${failedCount}` : `${failedCount} Failed`,
      classes: 'bg-red-100 text-red-700 border-red-200',
    },
    OFFLINE: {
      icon: <WifiOff className="h-3.5 w-3.5" />,
      label: 'Offline Mode',
      classes: 'bg-gray-100 text-gray-600 border-gray-200',
    },
  } as const;

  const { icon, label, classes } = config[syncStatus];

  return (
    <button
      onClick={() => isOnline && triggerSync()}
      title={
        !isOnline
          ? 'Offline — data saved locally'
          : syncStatus === 'PENDING'
          ? `${pendingCount} forms waiting to sync — click to sync now`
          : syncStatus === 'FAILED'
          ? `${failedCount} forms failed to sync — click to retry`
          : lastSyncedAt
          ? `Last synced: ${new Date(lastSyncedAt).toLocaleTimeString()}`
          : 'All data synced'
      }
      className={cn(
        'flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all hover:opacity-80',
        classes,
        className,
      )}
    >
      {isOnline ? (
        syncStatus === 'SYNCED' ? (
          <Wifi className="h-3.5 w-3.5" />
        ) : (
          icon
        )
      ) : (
        icon
      )}
      {!compact && <span>{label}</span>}
    </button>
  );
}

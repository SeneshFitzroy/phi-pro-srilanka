'use client';

// H399 Collaborative Weekly Return — body now lives in
// components/h399-collab.tsx so it can also be embedded inside
// /dashboard/epidemiology without duplication. Both mount points share the
// same Yjs document (DOC_NAME = 'phi-pro:h399-weekly-return'), so edits
// made here surface live in the Epidemiology dashboard's Disease Trend +
// Cluster panels and vice versa.

import { H399Collab } from '@/components/h399-collab';

export default function H399CollabPage() {
  return <H399Collab />;
}

'use client';

// PaymentPipeline — the PHI/MOH side of /public/payments. Shows payment_records
// in real time and lets an officer advance each one through the 5-stage
// pipeline: Submitted -> Charging -> Captured -> PHI accepted -> Certificate
// ready. Live records update Firestore (onSnapshot reflects instantly); a few
// demo records are advanced locally so the flow is always demonstrable.

import { useEffect, useMemo, useState } from 'react';
import { Receipt, Check, X, Loader2, FileCheck, Radio } from 'lucide-react';
import { collection, onSnapshot, orderBy, query, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const STAGES = ['Submitted', 'Charging', 'Captured', 'PHI accepted', 'Certificate ready'] as const;
const STAGE_DOT = ['bg-slate-300', 'bg-amber-400', 'bg-blue-500', 'bg-emerald-500', 'bg-emerald-600'];

// Map any stored status to a 0..4 stage (or -1 for declined).
function stageIndex(status: string): number {
  switch (status) {
    case 'submitted': case 'pending_verification': return 0;
    case 'charging': return 1;
    case 'captured': case 'completed': return 2;
    case 'phi_accepted': return 3;
    case 'certificate_ready': return 4;
    case 'declined': return -1;
    default: return 0;
  }
}

interface PayRecord {
  id: string;
  paymentRef: string;
  serviceType: string;
  business: string;
  payer: string;
  amount: number;
  status: string;
  isLive?: boolean;
}

interface RawPay {
  paymentRef?: string;
  serviceType?: string;
  business?: { name?: string };
  payerName?: string;
  amount?: number;
  status?: string;
  createdAt?: { toDate?: () => Date };
}

const SAMPLE: PayRecord[] = [
  { id: 's1', paymentRef: 'PAY-880012451', serviceType: 'Food premises licence (H801)', business: 'Lotus Inn', payer: 'K. Perera', amount: 5000, status: 'captured' },
  { id: 's2', paymentRef: 'PAY-880012398', serviceType: 'Trade licence clearance', business: 'Fresh Mart', payer: 'M. Silva', amount: 7500, status: 'phi_accepted' },
  { id: 's3', paymentRef: 'PAY-880012377', serviceType: 'Factory health certificate (H1203)', business: 'Star Garments', payer: 'A. Bandara', amount: 12000, status: 'charging' },
];

export function PaymentPipeline() {
  const { user } = useAuth();
  const [live, setLive] = useState<PayRecord[]>([]);
  const [samples, setSamples] = useState<PayRecord[]>(SAMPLE);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'payment_records'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => setLive(snap.docs.map((d) => {
        const x = d.data() as RawPay;
        return {
          id: d.id,
          paymentRef: x.paymentRef || d.id,
          serviceType: x.serviceType || 'Service',
          business: x.business?.name || '—',
          payer: x.payerName || '—',
          amount: x.amount || 0,
          status: x.status || 'pending_verification',
          isLive: true,
        };
      })),
      (err) => console.warn('[payments] live read failed (showing samples):', err),
    );
    return () => unsub();
  }, []);

  const records = useMemo(() => [...live, ...samples], [live, samples]);

  const advance = async (rec: PayRecord, nextStatus: string) => {
    if (rec.isLive) {
      setBusy(rec.id);
      try {
        await updateDoc(doc(db, 'payment_records', rec.id), {
          status: nextStatus,
          reviewedBy: user?.displayName || user?.uid || 'PHI',
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.warn('[payments] update failed:', e);
      } finally {
        setBusy(null);
      }
    } else {
      setSamples((prev) => prev.map((r) => (r.id === rec.id ? { ...r, status: nextStatus } : r)));
    }
  };

  const counts = STAGES.map((_, i) => records.filter((r) => stageIndex(r.status) === i).length);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="h-5 w-5 text-blue-600" /> Payment processing pipeline
        </CardTitle>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Radio className="h-2.5 w-2.5 animate-pulse" /> Live
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          The officer side of <span className="font-mono">/public/payments</span>. Accept a captured payment, then issue the certificate — citizens see the status move in real time.
        </p>

        {/* Stage counters */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {STAGES.map((s, i) => (
            <div key={s} className="rounded-lg border border-slate-200 p-2 text-center dark:border-slate-800">
              <p className="text-lg font-bold">{counts[i]}</p>
              <p className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${STAGE_DOT[i]}`} /> {s}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {records.map((rec) => {
            const stage = stageIndex(rec.status);
            const declined = stage === -1;
            return (
              <div key={rec.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{rec.paymentRef}</span>
                      {rec.isLive && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><Radio className="h-2.5 w-2.5" /> Live</span>}
                    </div>
                    <p className="mt-0.5 text-sm font-semibold">{rec.serviceType}</p>
                    <p className="text-xs text-muted-foreground">{rec.business} · {rec.payer} · LKR {rec.amount.toLocaleString('en-LK')}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {!declined && stage >= 2 && stage < 3 && (
                      <>
                        <Button size="sm" disabled={busy === rec.id} onClick={() => advance(rec, 'phi_accepted')} className="bg-emerald-600 hover:bg-emerald-700">
                          {busy === rec.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Check className="mr-1 h-3.5 w-3.5" /> Accept</>}
                        </Button>
                        <Button size="sm" variant="outline" disabled={busy === rec.id} onClick={() => advance(rec, 'declined')}>
                          <X className="mr-1 h-3.5 w-3.5" /> Decline
                        </Button>
                      </>
                    )}
                    {!declined && stage === 3 && (
                      <Button size="sm" disabled={busy === rec.id} onClick={() => advance(rec, 'certificate_ready')} className="bg-emerald-600 hover:bg-emerald-700">
                        {busy === rec.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><FileCheck className="mr-1 h-3.5 w-3.5" /> Issue certificate</>}
                      </Button>
                    )}
                    {!declined && stage < 2 && <span className="self-center text-xs italic text-muted-foreground">Awaiting payment</span>}
                    {!declined && stage === 4 && <span className="self-center text-xs font-semibold text-emerald-600">Certificate ready</span>}
                    {declined && <span className="self-center text-xs font-semibold text-rose-600">Declined</span>}
                  </div>
                </div>

                {/* 5-stage progress */}
                {!declined && (
                  <div className="mt-3 flex items-center">
                    {STAGES.map((s, i) => (
                      <div key={s} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${i <= stage ? `${STAGE_DOT[i]} text-white` : 'bg-slate-200 text-slate-400 dark:bg-slate-700'}`}>
                            {i < stage ? <Check className="h-3 w-3" /> : i + 1}
                          </div>
                          <span className={`mt-1 hidden text-[9px] font-semibold sm:block ${i <= stage ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>{s}</span>
                        </div>
                        {i < STAGES.length - 1 && <div className={`mx-1 h-0.5 flex-1 ${i < stage ? STAGE_DOT[i + 1] : 'bg-slate-200 dark:bg-slate-700'}`} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

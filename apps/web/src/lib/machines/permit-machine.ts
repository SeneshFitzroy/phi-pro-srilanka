// ============================================================================
// PHI-PRO Permit Workflow — XState v5 Finite State Machine
// Models the complete lifecycle of a health permit application
// States: APPLIED → INSPECTION_SCHEDULED → INSPECTED → PAYMENT_PENDING
//         → ISSUED | REJECTED | REVOKED | EXPIRED
// ============================================================================

import { setup, assign } from 'xstate';
import { PermitStatus } from '@phi-pro/shared';

// ---------------------------------------------------------------------------
// Context (typed state for the machine)
// ---------------------------------------------------------------------------

export interface PermitContext {
  permitId: string;
  applicantId: string;
  permitType: string;
  status: PermitStatus;
  inspectionDate?: string;
  inspectionScore?: number;
  inspectorId?: string;
  paymentRef?: string;
  paymentAmount?: number;
  rejectionReason?: string;
  issuedAt?: string;
  expiresAt?: string;
  lastError?: string;
  auditLog: Array<{ action: string; performedAt: string; performedBy?: string }>;
}

// ---------------------------------------------------------------------------
// Events (typed actions that drive state transitions)
// ---------------------------------------------------------------------------

export type PermitEvent =
  | { type: 'SCHEDULE_INSPECTION'; date: string; inspectorId: string }
  | { type: 'COMPLETE_INSPECTION'; score: number; inspectorId: string }
  | { type: 'APPROVE'; paymentAmount: number }
  | { type: 'REJECT'; reason: string }
  | { type: 'PAYMENT_RECEIVED'; paymentRef: string }
  | { type: 'ISSUE'; expiresAt: string }
  | { type: 'REVOKE'; reason: string }
  | { type: 'EXPIRE' }
  | { type: 'RETRY' };

// ---------------------------------------------------------------------------
// XState v5 Machine definition
// ---------------------------------------------------------------------------

export const permitMachine = setup({
  types: {} as {
    context: PermitContext;
    events: PermitEvent;
  },

  actions: {
    logAction: assign({
      auditLog: ({ context, event }) => [
        ...context.auditLog,
        { action: event.type, performedAt: new Date().toISOString() },
      ],
    }),

    setInspectionScheduled: assign({
      status: () => PermitStatus.INSPECTION_SCHEDULED,
      inspectionDate: ({ event }) =>
        event.type === 'SCHEDULE_INSPECTION' ? event.date : undefined,
      inspectorId: ({ event }) =>
        event.type === 'SCHEDULE_INSPECTION' ? event.inspectorId : undefined,
    }),

    setInspected: assign({
      status: () => PermitStatus.INSPECTED,
      inspectionScore: ({ event }) =>
        event.type === 'COMPLETE_INSPECTION' ? event.score : undefined,
      inspectorId: ({ event }) =>
        event.type === 'COMPLETE_INSPECTION' ? event.inspectorId : undefined,
    }),

    setPaymentPending: assign({
      status: () => PermitStatus.PAYMENT_PENDING,
      paymentAmount: ({ event }) =>
        event.type === 'APPROVE' ? event.paymentAmount : undefined,
    }),

    setRejected: assign({
      status: () => PermitStatus.REJECTED,
      rejectionReason: ({ event }) =>
        event.type === 'REJECT' ? event.reason : undefined,
    }),

    setPaymentReceived: assign({
      paymentRef: ({ event }) =>
        event.type === 'PAYMENT_RECEIVED' ? event.paymentRef : undefined,
    }),

    setIssued: assign({
      status: () => PermitStatus.ISSUED,
      issuedAt: () => new Date().toISOString(),
      expiresAt: ({ event }) =>
        event.type === 'ISSUE' ? event.expiresAt : undefined,
    }),

    setRevoked: assign({
      status: () => PermitStatus.REVOKED,
    }),

    setExpired: assign({
      status: () => PermitStatus.EXPIRED,
    }),
  },

  guards: {
    inspectionPassed: ({ context }) => (context.inspectionScore ?? 0) >= 60,
    inspectionFailed: ({ context }) => (context.inspectionScore ?? 0) < 60,
  },
}).createMachine({
  id: 'permit',
  initial: 'applied',
  context: {
    permitId: '',
    applicantId: '',
    permitType: 'FOOD_PREMISES',
    status: PermitStatus.APPLIED,
    auditLog: [],
  },

  states: {
    applied: {
      on: {
        SCHEDULE_INSPECTION: {
          target: 'inspectionScheduled',
          actions: ['setInspectionScheduled', 'logAction'],
        },
      },
    },

    inspectionScheduled: {
      on: {
        COMPLETE_INSPECTION: {
          target: 'inspected',
          actions: ['setInspected', 'logAction'],
        },
      },
    },

    inspected: {
      always: [
        { guard: 'inspectionPassed', target: 'awaitingApproval' },
        { guard: 'inspectionFailed', target: 'rejected', actions: ['logAction'] },
      ],
    },

    awaitingApproval: {
      on: {
        APPROVE: {
          target: 'paymentPending',
          actions: ['setPaymentPending', 'logAction'],
        },
        REJECT: {
          target: 'rejected',
          actions: ['setRejected', 'logAction'],
        },
      },
    },

    paymentPending: {
      on: {
        PAYMENT_RECEIVED: {
          target: 'paymentReceived',
          actions: ['setPaymentReceived', 'logAction'],
        },
      },
    },

    paymentReceived: {
      on: {
        ISSUE: {
          target: 'issued',
          actions: ['setIssued', 'logAction'],
        },
      },
    },

    issued: {
      on: {
        REVOKE: {
          target: 'revoked',
          actions: ['setRevoked', 'logAction'],
        },
        EXPIRE: {
          target: 'expired',
          actions: ['setExpired', 'logAction'],
        },
      },
    },

    rejected: {
      type: 'final',
    },

    revoked: {
      type: 'final',
    },

    expired: {
      type: 'final',
    },
  },
});

// ---------------------------------------------------------------------------
// Complaint workflow machine (simpler lifecycle)
// ---------------------------------------------------------------------------

export type ComplaintState =
  | 'received'
  | 'assigned'
  | 'underInvestigation'
  | 'actionTaken'
  | 'resolved'
  | 'closed'
  | 'escalated';

export const complaintMachine = setup({
  types: {} as {
    context: {
      complaintId: string;
      assignedTo?: string;
      resolution?: string;
      escalationReason?: string;
      auditLog: Array<{ action: string; performedAt: string }>;
    };
    events:
      | { type: 'ASSIGN'; inspectorId: string }
      | { type: 'START_INVESTIGATION' }
      | { type: 'TAKE_ACTION'; description: string }
      | { type: 'RESOLVE'; resolution: string }
      | { type: 'CLOSE' }
      | { type: 'ESCALATE'; reason: string };
  },
  actions: {
    log: assign({
      auditLog: ({ context, event }) => [
        ...context.auditLog,
        { action: event.type, performedAt: new Date().toISOString() },
      ],
    }),
  },
}).createMachine({
  id: 'complaint',
  initial: 'received',
  context: {
    complaintId: '',
    auditLog: [],
  },
  states: {
    received: {
      on: {
        ASSIGN: { target: 'assigned', actions: 'log' },
        ESCALATE: { target: 'escalated', actions: 'log' },
      },
    },
    assigned: {
      on: {
        START_INVESTIGATION: { target: 'underInvestigation', actions: 'log' },
        ESCALATE: { target: 'escalated', actions: 'log' },
      },
    },
    underInvestigation: {
      on: {
        TAKE_ACTION: { target: 'actionTaken', actions: 'log' },
        ESCALATE: { target: 'escalated', actions: 'log' },
      },
    },
    actionTaken: {
      on: {
        RESOLVE: { target: 'resolved', actions: 'log' },
      },
    },
    resolved: {
      on: {
        CLOSE: { target: 'closed', actions: 'log' },
      },
    },
    closed: { type: 'final' },
    escalated: {
      on: {
        ASSIGN: { target: 'assigned', actions: 'log' },
      },
    },
  },
});

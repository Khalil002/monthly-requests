/**
 * Request status workflow, modelled as a small finite-state machine.
 *
 *   submitted ──► in_review ──► approved ──► in_progress ──► completed
 *                     │
 *                     └──► rejected ──► submitted (resubmit)
 *
 * Keeping the rules in one pure module means the UI, the Redux layer and
 * the mock API all agree on what is allowed, and the rules are trivial to test.
 */

export const STATUS = Object.freeze({
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
});

export const STATUS_ORDER = [
  STATUS.SUBMITTED,
  STATUS.IN_REVIEW,
  STATUS.APPROVED,
  STATUS.IN_PROGRESS,
  STATUS.COMPLETED,
  STATUS.REJECTED,
];

export const STATUS_LABELS = Object.freeze({
  [STATUS.SUBMITTED]: 'Submitted',
  [STATUS.IN_REVIEW]: 'In review',
  [STATUS.APPROVED]: 'Approved',
  [STATUS.IN_PROGRESS]: 'In progress',
  [STATUS.COMPLETED]: 'Completed',
  [STATUS.REJECTED]: 'Rejected',
});

/** Allowed transitions: from -> [{ to, action }] */
const TRANSITIONS = Object.freeze({
  [STATUS.SUBMITTED]: [{ to: STATUS.IN_REVIEW, action: 'Start review' }],
  [STATUS.IN_REVIEW]: [
    { to: STATUS.APPROVED, action: 'Approve' },
    { to: STATUS.REJECTED, action: 'Reject' },
  ],
  [STATUS.APPROVED]: [{ to: STATUS.IN_PROGRESS, action: 'Start work' }],
  [STATUS.IN_PROGRESS]: [{ to: STATUS.COMPLETED, action: 'Mark complete' }],
  [STATUS.COMPLETED]: [],
  [STATUS.REJECTED]: [{ to: STATUS.SUBMITTED, action: 'Resubmit' }],
});

export function isValidStatus(status) {
  return Object.prototype.hasOwnProperty.call(TRANSITIONS, status);
}

export function availableTransitions(status) {
  return TRANSITIONS[status] ?? [];
}

export function canTransition(from, to) {
  return availableTransitions(from).some((t) => t.to === to);
}

export function isTerminal(status) {
  return availableTransitions(status).length === 0;
}

/** Statuses that still need someone to act on them. */
export function isOpen(status) {
  return status !== STATUS.COMPLETED && status !== STATUS.REJECTED;
}

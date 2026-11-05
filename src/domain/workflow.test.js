import { describe, it, expect } from 'vitest';
import {
  STATUS,
  availableTransitions,
  canTransition,
  isTerminal,
  isOpen,
  isValidStatus,
} from './workflow';

describe('workflow', () => {
  it('allows the happy path from submitted to completed', () => {
    const path = [
      STATUS.SUBMITTED,
      STATUS.IN_REVIEW,
      STATUS.APPROVED,
      STATUS.IN_PROGRESS,
      STATUS.COMPLETED,
    ];
    for (let i = 0; i < path.length - 1; i++) {
      expect(canTransition(path[i], path[i + 1])).toBe(true);
    }
  });

  it('blocks skipping steps', () => {
    expect(canTransition(STATUS.SUBMITTED, STATUS.COMPLETED)).toBe(false);
    expect(canTransition(STATUS.SUBMITTED, STATUS.APPROVED)).toBe(false);
  });

  it('only allows rejection from review, and resubmission after it', () => {
    expect(canTransition(STATUS.IN_REVIEW, STATUS.REJECTED)).toBe(true);
    expect(canTransition(STATUS.APPROVED, STATUS.REJECTED)).toBe(false);
    expect(canTransition(STATUS.REJECTED, STATUS.SUBMITTED)).toBe(true);
  });

  it('treats completed as terminal', () => {
    expect(isTerminal(STATUS.COMPLETED)).toBe(true);
    expect(availableTransitions(STATUS.COMPLETED)).toEqual([]);
  });

  it('knows which statuses are open', () => {
    expect(isOpen(STATUS.IN_PROGRESS)).toBe(true);
    expect(isOpen(STATUS.COMPLETED)).toBe(false);
    expect(isOpen(STATUS.REJECTED)).toBe(false);
  });

  it('rejects unknown statuses', () => {
    expect(isValidStatus('archived')).toBe(false);
    expect(availableTransitions('archived')).toEqual([]);
  });
});

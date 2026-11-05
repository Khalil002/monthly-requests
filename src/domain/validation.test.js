import { describe, it, expect } from 'vitest';
import { validateRequest, isValid } from './validation';

const valid = {
  title: 'Quarterly sales dashboard',
  client: 'Acme Corp',
  category: 'Data & Reporting',
  priority: 'high',
  month: '2026-11',
  estimatedHours: 12,
  description: '',
};

describe('validateRequest', () => {
  it('accepts a valid payload', () => {
    expect(isValid(validateRequest(valid))).toBe(true);
  });

  it('flags every missing required field', () => {
    const errors = validateRequest({});
    expect(Object.keys(errors).sort()).toEqual(
      ['category', 'client', 'estimatedHours', 'month', 'priority', 'title'].sort(),
    );
  });

  it('trims whitespace before checking title and client', () => {
    const errors = validateRequest({ ...valid, title: '   ab  ', client: '   ' });
    expect(errors.title).toMatch(/at least 4/);
    expect(errors.client).toBeDefined();
  });

  it.each([
    ['2026-13'],
    ['26-01'],
    ['2026/01'],
  ])('rejects malformed month %s', (month) => {
    expect(validateRequest({ ...valid, month }).month).toBeDefined();
  });

  it.each([[0], [-3], [161], ['abc']])('rejects out-of-range hours %s', (estimatedHours) => {
    expect(validateRequest({ ...valid, estimatedHours }).estimatedHours).toBeDefined();
  });

  it('accepts numeric strings from form inputs', () => {
    expect(isValid(validateRequest({ ...valid, estimatedHours: '8' }))).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { addMonths, monthlyTotals, linearRegression, forecast, countBy } from './analytics';

describe('addMonths', () => {
  it('rolls over year boundaries', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
  });
});

describe('monthlyTotals', () => {
  it('groups by month, sums hours and fills gaps', () => {
    const totals = monthlyTotals([
      { month: '2026-01', estimatedHours: 4 },
      { month: '2026-03', estimatedHours: 6 },
      { month: '2026-01', estimatedHours: '2' },
    ]);
    expect(totals).toEqual([
      { month: '2026-01', count: 2, hours: 6 },
      { month: '2026-02', count: 0, hours: 0 },
      { month: '2026-03', count: 1, hours: 6 },
    ]);
  });

  it('returns an empty array for no data', () => {
    expect(monthlyTotals([])).toEqual([]);
  });
});

describe('linearRegression / forecast', () => {
  it('fits a perfect line', () => {
    const { slope, intercept } = linearRegression([2, 4, 6, 8]);
    expect(slope).toBeCloseTo(2);
    expect(intercept).toBeCloseTo(2);
    expect(forecast([2, 4, 6, 8], 2)).toEqual([10, 12]);
  });

  it('handles tiny series', () => {
    expect(forecast([], 1)).toEqual([0]);
    expect(forecast([5], 1)).toEqual([5]);
  });

  it('never predicts negative volume', () => {
    expect(forecast([10, 6, 2], 2)).toEqual([0, 0]);
  });
});

describe('countBy', () => {
  it('counts items by key', () => {
    expect(countBy([{ s: 'a' }, { s: 'b' }, { s: 'a' }], 's')).toEqual({ a: 2, b: 1 });
  });
});

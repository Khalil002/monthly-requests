/**
 * Small, dependency-free analytics helpers used by the dashboard.
 * They work on plain arrays so they can run on the client or be moved
 * behind an API without changes.
 */

/** "2026-03" -> "2026-04" */
export function addMonths(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function currentMonth(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonth(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Aggregate requests per month over a contiguous range (gaps filled with 0).
 * Single pass with a Map: O(n + months).
 */
export function monthlyTotals(requests) {
  if (requests.length === 0) return [];
  const buckets = new Map();
  for (const r of requests) {
    const b = buckets.get(r.month) ?? { count: 0, hours: 0 };
    b.count += 1;
    b.hours += Number(r.estimatedHours) || 0;
    buckets.set(r.month, b);
  }
  const months = [...buckets.keys()].sort();
  const result = [];
  for (let m = months[0]; m <= months[months.length - 1]; m = addMonths(m, 1)) {
    const b = buckets.get(m) ?? { count: 0, hours: 0 };
    result.push({ month: m, ...b });
  }
  return result;
}

/**
 * Ordinary least-squares fit of y = a + b·x for x = 0..n-1.
 * Returns { slope, intercept }.
 */
export function linearRegression(values) {
  const n = values.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  if (n === 1) return { slope: 0, intercept: values[0] };
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let den = 0;
  values.forEach((y, x) => {
    num += (x - meanX) * (y - meanY);
    den += (x - meanX) ** 2;
  });
  const slope = num / den;
  return { slope, intercept: meanY - slope * meanX };
}

/**
 * Forecast the next `horizon` values from a series using a linear trend.
 * Predictions are clamped at zero and rounded to one decimal.
 */
export function forecast(values, horizon = 1) {
  const { slope, intercept } = linearRegression(values);
  return Array.from({ length: horizon }, (_, i) => {
    const y = intercept + slope * (values.length + i);
    return Math.max(0, Math.round(y * 10) / 10);
  });
}

export function countBy(items, key) {
  return items.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] ?? 0) + 1;
    return acc;
  }, {});
}

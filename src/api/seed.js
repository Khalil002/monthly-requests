import { addMonths, currentMonth } from '../domain/analytics';
import { STATUS } from '../domain/workflow';

const CLIENTS = ['Acme Corp', 'Globex', 'Initech', 'Umbrella Health', 'Stark Retail'];

// [title, category, priority, hours, monthOffset, status]
const ROWS = [
  ['Landing page refresh', 'Design', 'medium', 16, -5, STATUS.COMPLETED],
  ['Fix checkout rounding bug', 'Development', 'urgent', 4, -5, STATUS.COMPLETED],
  ['Monthly KPI report', 'Data & Reporting', 'medium', 6, -4, STATUS.COMPLETED],
  ['Upgrade Node runtime', 'Maintenance', 'low', 8, -4, STATUS.COMPLETED],
  ['Onboarding email templates', 'Design', 'low', 10, -4, STATUS.REJECTED],
  ['Customer churn dashboard', 'Data & Reporting', 'high', 24, -3, STATUS.COMPLETED],
  ['Accessibility audit', 'Development', 'high', 20, -3, STATUS.COMPLETED],
  ['Help-desk macro cleanup', 'Support', 'low', 3, -3, STATUS.COMPLETED],
  ['Mobile nav redesign', 'Design', 'medium', 18, -2, STATUS.COMPLETED],
  ['Inventory sync job', 'Development', 'high', 30, -2, STATUS.COMPLETED],
  ['Monthly KPI report', 'Data & Reporting', 'medium', 6, -2, STATUS.COMPLETED],
  ['SSL certificate renewal', 'Maintenance', 'urgent', 2, -2, STATUS.COMPLETED],
  ['Search relevance tuning', 'Development', 'medium', 14, -1, STATUS.IN_PROGRESS],
  ['Monthly KPI report', 'Data & Reporting', 'medium', 6, -1, STATUS.COMPLETED],
  ['Holiday campaign banners', 'Design', 'high', 12, -1, STATUS.COMPLETED],
  ['Database index review', 'Maintenance', 'medium', 8, -1, STATUS.APPROVED],
  ['Live chat widget', 'Development', 'high', 26, -1, STATUS.IN_PROGRESS],
  ['Monthly KPI report', 'Data & Reporting', 'medium', 6, 0, STATUS.IN_REVIEW],
  ['Pricing page A/B test', 'Development', 'high', 16, 0, STATUS.APPROVED],
  ['Refund flow copy update', 'Support', 'low', 2, 0, STATUS.SUBMITTED],
  ['Dark mode for dashboard', 'Design', 'medium', 20, 0, STATUS.SUBMITTED],
  ['Error-rate alerting', 'Maintenance', 'urgent', 5, 0, STATUS.IN_REVIEW],
  ['Sales forecast export', 'Data & Reporting', 'high', 10, 0, STATUS.SUBMITTED],
];

export function buildSeed(now = new Date()) {
  const base = currentMonth(now);
  return ROWS.map(([title, category, priority, estimatedHours, offset, status], i) => {
    const month = addMonths(base, offset);
    const createdAt = `${month}-${String((i % 20) + 1).padStart(2, '0')}T09:00:00.000Z`;
    return {
      id: `req-${String(i + 1).padStart(3, '0')}`,
      title,
      client: CLIENTS[i % CLIENTS.length],
      category,
      priority,
      estimatedHours,
      month,
      description: '',
      status,
      createdAt,
      updatedAt: createdAt,
      history: [{ status, at: createdAt }],
    };
  });
}

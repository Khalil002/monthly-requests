import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectDashboardStats, selectStatusCounts } from '../store/selectors';
import { STATUS_ORDER, STATUS_LABELS } from '../domain/workflow';
import StatCard from './StatCard';
import MonthlyChart from './MonthlyChart';

export default function Dashboard() {
  const stats = useSelector(selectDashboardStats);
  const counts = useSelector(selectStatusCounts);
  const [metric, setMetric] = useState('count');
  const total = Object.values(counts).reduce((s, n) => s + n, 0) || 1;

  return (
    <section aria-labelledby="dash-title" className="stack">
      <h2 id="dash-title" className="visually-hidden">
        Dashboard
      </h2>

      <div className="stats">
        <StatCard label="Requests this month" value={stats.thisMonthCount} />
        <StatCard label="Hours requested this month" value={`${stats.thisMonthHours}h`} />
        <StatCard
          label="Open requests"
          value={stats.openCount}
          hint={stats.urgentOpen ? `${stats.urgentOpen} urgent` : 'None urgent'}
          tone={stats.urgentOpen ? 'warn' : undefined}
        />
        <StatCard
          label="Forecast next month"
          value={`≈ ${Math.round(stats.forecast.count)}`}
          hint={`requests, ~${Math.round(stats.forecast.hours)}h of work`}
          tone="accent"
        />
      </div>

      <div className="grid-2">
        <article className="panel">
          <header className="panel__header">
            <h3>Monthly volume</h3>
            <div className="segmented" role="group" aria-label="Chart metric">
              {['count', 'hours'].map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={metric === m}
                  onClick={() => setMetric(m)}
                >
                  {m === 'count' ? 'Requests' : 'Hours'}
                </button>
              ))}
            </div>
          </header>
          <MonthlyChart series={stats.series} forecast={stats.forecast} metric={metric} />
        </article>

        <article className="panel">
          <header className="panel__header">
            <h3>Pipeline</h3>
          </header>
          <ul className="pipeline">
            {STATUS_ORDER.map((s) => (
              <li key={s}>
                <span className="pipeline__label">{STATUS_LABELS[s]}</span>
                <span className="pipeline__track">
                  <span
                    className={`pipeline__fill badge--${s}`}
                    style={{ width: `${((counts[s] ?? 0) / total) * 100}%` }}
                  />
                </span>
                <span className="pipeline__count">{counts[s] ?? 0}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

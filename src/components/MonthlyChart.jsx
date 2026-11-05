import { formatMonth } from '../domain/analytics';

/**
 * Accessible bar chart built with plain HTML/CSS: each bar is a list item,
 * heights are percentages, and the forecast bar is visually distinct.
 */
export default function MonthlyChart({ series, forecast, metric = 'count' }) {
  const bars = [...series.slice(-6), { ...forecast, isForecast: true }];
  const max = Math.max(1, ...bars.map((b) => b[metric]));
  const unit = metric === 'hours' ? 'h' : '';

  return (
    <figure className="chart">
      <ol className="chart__bars" aria-label={`Requests ${metric} per month`}>
        {bars.map((b) => (
          <li
            key={b.month}
            className={`chart__col ${b.isForecast ? 'chart__col--forecast' : ''}`}
            aria-label={`${formatMonth(b.month)}: ${b[metric]}${unit}${b.isForecast ? ' (forecast)' : ''}`}
          >
            <span className="chart__value">
              {b[metric]}
              {unit}
            </span>
            <span className="chart__bar" style={{ height: `${(b[metric] / max) * 100}%` }} />
            <span className="chart__label" aria-hidden="true">
              {formatMonth(b.month).split(' ')[0]}
              <br />
              {b.month.slice(0, 4)}
            </span>
          </li>
        ))}
      </ol>
      <figcaption className="chart__caption">
        Dashed bar is a linear-trend forecast for {formatMonth(forecast.month)}.
      </figcaption>
    </figure>
  );
}

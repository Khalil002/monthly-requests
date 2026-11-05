import { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changeStatus } from '../store/requestsSlice';
import { availableTransitions, STATUS, STATUS_LABELS } from '../domain/workflow';
import { formatMonth } from '../domain/analytics';
import StatusBadge from './StatusBadge';

const dateFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });

function RequestCard({ request }) {
  const dispatch = useDispatch();
  const busy = useSelector((s) => Boolean(s.requests.pendingIds[request.id]));
  const actions = availableTransitions(request.status);

  return (
    <article className="card" aria-labelledby={`title-${request.id}`}>
      <header className="card__header">
        <div>
          <h3 id={`title-${request.id}`} className="card__title">
            {request.title}
          </h3>
          <p className="card__meta">
            {request.client} · {request.category} · {formatMonth(request.month)}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </header>

      {request.description && <p className="card__desc">{request.description}</p>}

      <dl className="card__facts">
        <div>
          <dt>Priority</dt>
          <dd className={`prio prio--${request.priority}`}>{request.priority}</dd>
        </div>
        <div>
          <dt>Estimate</dt>
          <dd>{request.estimatedHours}h</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>
            <time dateTime={request.updatedAt}>{dateFmt.format(new Date(request.updatedAt))}</time>
          </dd>
        </div>
      </dl>

      <details className="card__history">
        <summary>History ({request.history.length})</summary>
        <ol>
          {request.history.map((h, i) => (
            <li key={i}>
              <StatusBadge status={h.status} />{' '}
              <time dateTime={h.at}>{dateFmt.format(new Date(h.at))}</time>
            </li>
          ))}
        </ol>
      </details>

      {actions.length > 0 && (
        <footer className="card__actions">
          {actions.map(({ to, action }) => (
            <button
              key={to}
              type="button"
              className={`btn ${to === STATUS.REJECTED ? 'btn--danger' : 'btn--primary'}`}
              disabled={busy}
              onClick={() => dispatch(changeStatus({ id: request.id, status: to }))}
              aria-label={`${action}: ${request.title} (move to ${STATUS_LABELS[to]})`}
            >
              {action}
            </button>
          ))}
        </footer>
      )}
    </article>
  );
}

export default memo(RequestCard);

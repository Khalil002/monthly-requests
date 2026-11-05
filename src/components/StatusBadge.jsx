import { STATUS_LABELS } from '../domain/workflow';

export default function StatusBadge({ status }) {
  return (
    <span className={`badge badge--${status}`} data-testid="status-badge">
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

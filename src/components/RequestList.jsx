import { useSelector } from 'react-redux';
import { selectVisibleRequests } from '../store/selectors';
import { selectRequestCount } from '../store/requestsSlice';
import FilterBar from './FilterBar';
import RequestCard from './RequestCard';

export default function RequestList() {
  const visible = useSelector(selectVisibleRequests);
  const total = useSelector(selectRequestCount);
  const loading = useSelector((s) => s.requests.loading);

  return (
    <section aria-labelledby="list-title" className="stack">
      <div className="section-head">
        <h2 id="list-title">Requests</h2>
        <p className="muted" aria-live="polite">
          Showing {visible.length} of {total}
        </p>
      </div>
      <FilterBar />
      {loading === 'pending' && total === 0 ? (
        <p className="empty">Loading requests…</p>
      ) : visible.length === 0 ? (
        <p className="empty">No requests match these filters.</p>
      ) : (
        <div className="cards">
          {visible.map((r) => (
            <RequestCard key={r.id} request={r} />
          ))}
        </div>
      )}
    </section>
  );
}

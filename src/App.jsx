import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, dismissError } from './store/requestsSlice';
import { useHashView } from './hooks/useHashView';
import Dashboard from './components/Dashboard';
import RequestList from './components/RequestList';
import RequestForm from './components/RequestForm';

const VIEWS = ['dashboard', 'requests', 'new'];
const LABELS = { dashboard: 'Dashboard', requests: 'Requests', new: 'New request' };

export default function App() {
  const dispatch = useDispatch();
  const error = useSelector((s) => s.requests.error);
  const [view, navigate] = useHashView(VIEWS, 'dashboard');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="topbar">
        <div className="topbar__inner">
          <h1 className="brand">
            <span className="brand__logo" aria-hidden="true" />
            Monthly Requests
          </h1>
          <nav aria-label="Main">
            <ul className="tabs">
              {VIEWS.map((v) => (
                <li key={v}>
                  <a
                    href={`#/${v}`}
                    aria-current={view === v ? 'page' : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(v);
                    }}
                  >
                    {LABELS[v]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main" className="container">
        {error && (
          <div className="alert" role="alert">
            <span>{error}</span>
            <button type="button" className="btn btn--ghost" onClick={() => dispatch(dismissError())}>
              Dismiss
            </button>
          </div>
        )}
        {notice && (
          <div className="notice" role="status">
            {notice}
          </div>
        )}

        {view === 'dashboard' && <Dashboard />}
        {view === 'requests' && <RequestList />}
        {view === 'new' && (
          <RequestForm
            onCreated={(r) => {
              setNotice(`“${r.title}” was submitted.`);
              navigate('requests');
            }}
          />
        )}
      </main>

      <footer className="site-footer container">
        <p className="muted">Demo data is stored in your browser (localStorage).</p>
      </footer>
    </>
  );
}

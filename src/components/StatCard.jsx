export default function StatCard({ label, value, hint, tone }) {
  return (
    <article className={`stat ${tone ? `stat--${tone}` : ''}`}>
      <p className="stat__label">{label}</p>
      <p className="stat__value">{value}</p>
      {hint && <p className="stat__hint">{hint}</p>}
    </article>
  );
}

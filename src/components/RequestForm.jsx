import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createRequest } from '../store/requestsSlice';
import {
  CATEGORIES,
  PRIORITIES,
  MAX_HOURS,
  validateRequest,
  isValid,
} from '../domain/validation';
import { currentMonth } from '../domain/analytics';

const emptyForm = () => ({
  title: '',
  client: '',
  category: '',
  priority: 'medium',
  month: currentMonth(),
  estimatedHours: '',
  description: '',
});

export default function RequestForm({ onCreated }) {
  const dispatch = useDispatch();
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const update = (e) => {
    const { name, value } = e.target;
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name]) setErrors(validateRequest(next));
  };

  const blur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
    setErrors(validateRequest(values));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateRequest(values);
    setErrors(found);
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
    if (!isValid(found)) return;

    setSubmitting(true);
    setFormError(null);
    const result = await dispatch(createRequest(values));
    setSubmitting(false);

    if (createRequest.fulfilled.match(result)) {
      setValues(emptyForm());
      setTouched({});
      onCreated?.(result.payload);
    } else if (result.payload?.errors) {
      setErrors(result.payload.errors); // server-side validation (422)
    } else {
      setFormError(result.payload?.error ?? 'Something went wrong. Please try again.');
    }
  };

  const err = (name) => (touched[name] ? errors[name] : undefined);
  const fieldProps = (name) => ({
    id: `rf-${name}`,
    name,
    value: values[name],
    onChange: update,
    onBlur: blur,
    'aria-invalid': Boolean(err(name)),
    'aria-describedby': err(name) ? `rf-${name}-err` : undefined,
  });
  const ErrorText = ({ name }) =>
    err(name) ? (
      <span id={`rf-${name}-err`} className="field__error" role="alert">
        {err(name)}
      </span>
    ) : null;

  return (
    <section aria-labelledby="form-title" className="panel form-panel">
      <h2 id="form-title">New monthly request</h2>
      <p className="muted">Tell the team what you need this month. Required fields are marked *.</p>

      <form onSubmit={handleSubmit} noValidate className="form">
        <label className="field field--full" htmlFor="rf-title">
          <span>Title *</span>
          <input {...fieldProps('title')} maxLength={80} placeholder="e.g. Monthly KPI report" />
          <ErrorText name="title" />
        </label>

        <label className="field" htmlFor="rf-client">
          <span>Client *</span>
          <input {...fieldProps('client')} placeholder="Company name" autoComplete="organization" />
          <ErrorText name="client" />
        </label>

        <label className="field" htmlFor="rf-category">
          <span>Category *</span>
          <select {...fieldProps('category')}>
            <option value="">Select…</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <ErrorText name="category" />
        </label>

        <fieldset className="field field--full">
          <legend>Priority *</legend>
          <div className="radio-row">
            {PRIORITIES.map((p) => (
              <label key={p} className={`chip prio--${p}`}>
                <input
                  type="radio"
                  name="priority"
                  value={p}
                  checked={values.priority === p}
                  onChange={update}
                />
                {p}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="field" htmlFor="rf-month">
          <span>Month *</span>
          <input {...fieldProps('month')} type="month" />
          <ErrorText name="month" />
        </label>

        <label className="field" htmlFor="rf-estimatedHours">
          <span>Estimated hours *</span>
          <input
            {...fieldProps('estimatedHours')}
            type="number"
            min="1"
            max={MAX_HOURS}
            inputMode="numeric"
          />
          <ErrorText name="estimatedHours" />
        </label>

        <label className="field field--full" htmlFor="rf-description">
          <span>Description</span>
          <textarea {...fieldProps('description')} rows={4} maxLength={1000} />
          <span className="field__hint">{values.description.length}/1000</span>
          <ErrorText name="description" />
        </label>

        {formError && (
          <p className="alert" role="alert">
            {formError}
          </p>
        )}

        <div className="form__actions field--full">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit request'}
          </button>
        </div>
      </form>
    </section>
  );
}

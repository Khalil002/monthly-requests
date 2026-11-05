export const CATEGORIES = ['Design', 'Development', 'Data & Reporting', 'Maintenance', 'Support'];
export const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export const MAX_HOURS = 160;

/**
 * Validate a new-request payload. Returns an object of field -> message;
 * an empty object means the payload is valid.
 */
export function validateRequest(input = {}) {
  const errors = {};
  const title = (input.title ?? '').trim();
  const client = (input.client ?? '').trim();
  const hours = Number(input.estimatedHours);

  if (title.length < 4) errors.title = 'Title must be at least 4 characters.';
  else if (title.length > 80) errors.title = 'Title must be 80 characters or fewer.';

  if (!client) errors.client = 'Client is required.';

  if (!CATEGORIES.includes(input.category)) errors.category = 'Choose a category.';
  if (!PRIORITIES.includes(input.priority)) errors.priority = 'Choose a priority.';

  if (!MONTH_RE.test(input.month ?? '')) errors.month = 'Month must look like YYYY-MM.';

  if (input.estimatedHours === '' || input.estimatedHours == null || Number.isNaN(hours)) {
    errors.estimatedHours = 'Estimated hours is required.';
  } else if (hours <= 0 || hours > MAX_HOURS) {
    errors.estimatedHours = `Hours must be between 1 and ${MAX_HOURS}.`;
  }

  if ((input.description ?? '').length > 1000) {
    errors.description = 'Description must be 1000 characters or fewer.';
  }

  return errors;
}

export function isValid(errors) {
  return Object.keys(errors).length === 0;
}

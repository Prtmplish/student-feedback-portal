const ROLL_PATTERN = /^[A-Z]{2,4}\d{3,6}$/;

function validateFeedback(form) {
  const errors = [];
  if (!form || typeof form !== 'object') return ['Form must be an object'];

  if (!form.name || !String(form.name).trim()) errors.push('Name is required');
  if (!ROLL_PATTERN.test(String(form.rollNo || ''))) errors.push('Roll number must look like BCA12345');

  const rating = Number(form.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.push('Rating must be a whole number from 1 to 5');

  if (form.comment && String(form.comment).length > 500) errors.push('Comment must be 500 characters or less');
  return errors;
}

module.exports = { validateFeedback };

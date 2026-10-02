const test = require('node:test');
const assert = require('node:assert');
const { validateFeedback } = require('../src/lib/validate');

const good = { name: 'Ananya', rollNo: 'BCA23011', rating: 5, comment: 'Great' };

test('accepts a valid form', () => {
  assert.deepStrictEqual(validateFeedback(good), []);
});

test('rejects missing name', () => {
  assert.ok(validateFeedback({ ...good, name: '' }).includes('Name is required'));
});

test('rejects rating outside 1-5', () => {
  assert.strictEqual(validateFeedback({ ...good, rating: 7 }).length, 1);
});

test('rejects a bad roll number', () => {
  assert.strictEqual(validateFeedback({ ...good, rollNo: '123' }).length, 1);
});

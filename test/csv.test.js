const test = require('node:test');
const assert = require('node:assert');
const { toCsv, escapeCsvField } = require('../src/lib/csv');

const HEADER = 'id,name,rollNo,rating,comment,createdAt';

test('converts records to CSV with a header row', () => {
  const records = [
    { id: 1, name: 'Ananya', rollNo: 'BCA23011', rating: 5, comment: 'Great', createdAt: '2026-11-01T10:00:00.000Z' },
    { id: 2, name: 'Rahul', rollNo: 'BCA23012', rating: 3, comment: '', createdAt: '2026-11-02T10:00:00.000Z' }
  ];
  assert.strictEqual(
    toCsv(records),
    HEADER + '\r\n' +
    '1,Ananya,BCA23011,5,Great,2026-11-01T10:00:00.000Z\r\n' +
    '2,Rahul,BCA23012,3,,2026-11-02T10:00:00.000Z\r\n'
  );
});

test('quotes fields containing commas, quotes and newlines', () => {
  assert.strictEqual(escapeCsvField('fast, clear'), '"fast, clear"');
  assert.strictEqual(escapeCsvField('said "wow"'), '"said ""wow"""');
  assert.strictEqual(escapeCsvField('line1\nline2'), '"line1\nline2"');
});

test('neutralises values that start with a formula character', () => {
  assert.strictEqual(escapeCsvField('=SUM(A1)'), "'=SUM(A1)");
  assert.strictEqual(escapeCsvField('@cmd'), "'@cmd");
  assert.strictEqual(escapeCsvField('+1'), "'+1");
});

test('returns only the header for an empty list', () => {
  assert.strictEqual(toCsv([]), HEADER + '\r\n');
});

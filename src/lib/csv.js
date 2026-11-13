const COLUMNS = ['id', 'name', 'rollNo', 'rating', 'comment', 'createdAt'];

// Characters that make Excel/Sheets treat a cell as a formula.
const FORMULA_START = /^[=+\-@\t\r]/;

function escapeCsvField(value) {
  if (value === null || value === undefined) return '';
  let text = String(value);
  if (FORMULA_START.test(text)) text = "'" + text;
  if (/[",\r\n]/.test(text)) text = '"' + text.replace(/"/g, '""') + '"';
  return text;
}

function toCsv(records) {
  const lines = [COLUMNS.join(',')];
  for (const record of records) {
    lines.push(COLUMNS.map(col => escapeCsvField(record[col])).join(','));
  }
  return lines.join('\r\n') + '\r\n';
}

module.exports = { toCsv, escapeCsvField };

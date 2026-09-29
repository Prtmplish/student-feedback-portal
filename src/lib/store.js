const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', '..', 'data', 'feedback.json');

function readAll() {
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function add(entry) {
  const all = readAll();
  const record = {
    id: all.length ? Math.max(...all.map(e => e.id)) + 1 : 1,
    name: String(entry.name).trim(),
    rollNo: String(entry.rollNo),
    rating: Number(entry.rating),
    comment: entry.comment ? String(entry.comment).trim() : '',
    createdAt: new Date().toISOString()
  };
  all.push(record);
  fs.writeFileSync(FILE, JSON.stringify(all, null, 2));
  return record;
}

module.exports = { readAll, add };

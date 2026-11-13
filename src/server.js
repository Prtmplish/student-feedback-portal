const http = require('http');
const fs = require('fs');
const path = require('path');
const { validateFeedback } = require('./lib/validate');
const store = require('./lib/store');
const { toCsv } = require('./lib/csv');

const PORT = process.env.PORT || 3000;

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html')));
  }

  if (req.method === 'GET' && req.url === '/api/feedback') {
    return sendJson(res, 200, store.readAll());
  }

  if (req.method === 'GET' && req.url === '/api/feedback.csv') {
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="feedback.csv"'
    });
    // The BOM lets Excel detect UTF-8 so non-ASCII names display correctly.
    return res.end('﻿' + toCsv(store.readAll()));
  }

  if (req.method === 'POST' && req.url === '/api/feedback') {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      let form;
      try { form = JSON.parse(raw); } catch { return sendJson(res, 400, { errors: ['Invalid JSON'] }); }
      const errors = validateFeedback(form);
      if (errors.length) return sendJson(res, 400, { errors });
      return sendJson(res, 201, store.add(form));
    });
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => console.log(`Student Feedback Portal running on http://localhost:${PORT}`));

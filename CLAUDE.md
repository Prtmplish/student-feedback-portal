# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A small Node.js app with **no dependencies** (no `npm install` needed). Students submit feedback through a form and teachers see the responses in a table. It is a demo app for the "5 Levels of Claude & Claude Code" training. Keep it dependency-free: use only Node built-ins (`http`, `fs`, `node:test`, `node:assert`).

## Commands

- `npm run dev`: start the server on http://localhost:3000 (set `PORT` to change it). There is no hot reload, so restart after changing server code.
- `npm test`: run all tests with Node's built-in runner (`node --test`), which picks up `test/*.test.js`.
- Run a single test file: `node --test test/validate.test.js`
- Run a single test by name: `node --test --test-name-pattern="bad roll number"`
- `npm run lint`: runs the custom linter in `scripts/lint.js`. It runs `node --check` on every `.js` file in `src/`, `scripts/` and `test/`, and fails on any line that starts with a `var` declaration (use `let`/`const`). There is no ESLint or Prettier.
- `npm run report`: prints the response count and average rating to the terminal.

## Architecture

- `src/server.js` is a plain `http.createServer` with routes matched by hand on exact `req.method` + `req.url` (no router, so query strings won't match):
  - `GET /` serves `public/index.html`
  - `GET /api/feedback` returns every record
  - `GET /api/feedback.csv` downloads every record as CSV (UTF-8 with BOM, CRLF line endings)
  - `POST /api/feedback` parses the JSON body, then runs `validateFeedback`. It returns `400 { errors: [...] }` on bad input, or `201` with the stored record.
  - Anything else returns `404 { error }`.
- `src/lib/validate.js` holds the validation rules and returns an array of error strings (an empty array means valid). Rules: name required; `rollNo` must match `/^[A-Z]{2,4}\d{3,6}$/` (e.g. `BCA12345`); `rating` is a whole number from 1 to 5; `comment` is optional, at most 500 characters. The tests in `test/validate.test.js` check exact error messages and error counts, so update them when you change a rule.
- `src/lib/store.js` uses `data/feedback.json` as the database: a **top-level JSON array** of `{ id, name, rollNo, rating, comment, createdAt }`. Every call reads the whole file synchronously, and `add()` writes the whole file back. `add()` normalizes fields and sets `id` to the current max id + 1. `data/feedback.json` is committed sample data, so running the app and submitting the form changes a tracked file.
- `src/lib/csv.js` has `toCsv(records)` and `escapeCsvField(value)`. Fields follow RFC 4180 quoting, and values starting with `= + - @` get a `'` prefix so spreadsheets don't run them as formulas.
- `public/index.html` is a single page with inline CSS/JS. It calls `fetch('/api/feedback')` to render the table and to POST the form.
- `scripts/report.js` loads `data/feedback.json` directly with `require`, without going through `store.js`.

## Known issue

`scripts/report.js` reads `data.entries`, but `data/feedback.json` is a plain array, so `npm run report` currently crashes. Fix it by using the array directly (or by calling `store.readAll()`).

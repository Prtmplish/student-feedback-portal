// Minimal lint: syntax check every JS file and ban `var` declarations.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const roots = ['src', 'scripts', 'test'];
const files = [];
const walk = dir => fs.existsSync(dir) && fs.readdirSync(dir, { withFileTypes: true }).forEach(d => {
  const p = path.join(dir, d.name);
  if (d.isDirectory()) walk(p); else if (p.endsWith('.js')) files.push(p);
});
roots.forEach(walk);

let problems = 0;
for (const f of files) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); }
  catch (e) { problems++; console.error(`${f}: syntax error\n${e.stderr}`); }
  fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    if (/^\s*var\s/.test(line)) { problems++; console.error(`${f}:${i + 1}: use let/const instead of var`); }
  });
}
if (problems) { console.error(`lint: ${problems} problem(s)`); process.exit(1); }
console.log(`lint: ${files.length} files OK`);

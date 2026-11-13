// PreToolUse hook: blocks edits to protected paths.
// Exit code 2 = block the tool call and send the message back to Claude.
let raw = '';
process.stdin.on('data', c => { raw += c; });
process.stdin.on('end', () => {
  let filePath = '';
  try { filePath = (JSON.parse(raw).tool_input || {}).file_path || ''; } catch { process.exit(0); }
  const p = filePath.replace(/\\/g, '/');
  const blocked = [/\/data\//, /(^|\/)\.env/, /\/\.git\//];
  if (blocked.some(re => re.test(p))) {
    console.error(`Blocked by guardrail: ${filePath} is protected. Use the app's API or ask a human.`);
    process.exit(2);
  }
  process.exit(0);
});

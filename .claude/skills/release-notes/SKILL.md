---
name: release-notes
description: Writes release notes from recent git history. Use when the user asks
  for release notes, a changelog or a summary of recent changes.
---

# Release notes

1. Run `git log --oneline -20` (or since the last tag if the user names one).
2. Group commits by their type prefix:
   - feat → New features
   - fix → Fixes
   - test, chore, refactor → Internal
3. Rewrite each item in plain language for teachers and students, not developers.
4. Skip merge commits and version bumps.
5. Output Markdown: a one-line summary on top, then one heading per group.
6. End with "Thanks to everyone who shared feedback!"

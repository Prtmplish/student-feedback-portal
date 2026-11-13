#!/usr/bin/env bash
# Agentic OS demo: picks one GitHub issue labelled "ready" and runs
# builder -> QA -> reviewer, then opens a PR for a human to merge.
# Usage: ./orchestrator.sh            (picks the oldest "ready" issue)
#        ./orchestrator.sh 3          (runs a specific issue number)
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
mkdir -p logs

ISSUE="${1:-$(gh issue list --label ready --limit 1 --search 'sort:created-asc' --json number --jq '.[0].number // empty')}"
if [ -z "$ISSUE" ]; then echo "No issue labelled 'ready'. Nothing to do."; exit 0; fi

TITLE=$(gh issue view "$ISSUE" --json title --jq .title)
BODY=$(gh issue view "$ISSUE" --json body --jq .body)
BRANCH="feat/issue-$ISSUE"

say ()  { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
move () { gh issue edit "$ISSUE" --remove-label "$1" --add-label "$2" >/dev/null; say "Board: #$ISSUE  $1 → $2"; }
result () { node -e 'const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")); console.log(j.result ?? "")' "$1"; }
agent () {  # $1 = log name, $2 = prompt
  claude -p "$2" --permission-mode acceptEdits --max-turns 30 --output-format json > "logs/$1-$ISSUE.json"
  result "logs/$1-$ISSUE.json"
}

say "Picked issue #$ISSUE: $TITLE"
git checkout -q main && git pull -q --ff-only origin main
git checkout -q -B "$BRANCH"

# 1. BUILD
move ready in-progress
agent build "Use the builder subagent to implement GitHub issue #$ISSUE.
Title: $TITLE
Issue text:
$BODY"
git add -A && git commit -q -m "feat: $TITLE (#$ISSUE)" || say "Builder made no changes"

# 2. QA
move in-progress in-qa
agent qa "Use the qa subagent to verify the current code against the acceptance criteria of issue #$ISSUE.
Issue text:
$BODY"
git add -A && git commit -q -m "test: cover acceptance criteria for #$ISSUE" || true

# 3. Deterministic gate: tests must pass, whatever the agents said
say "Gate: npm test"
if ! npm test --silent; then
  move in-qa blocked
  gh issue comment "$ISSUE" --body "Pipeline stopped: tests failed on \`$BRANCH\`. A human needs to look." >/dev/null
  exit 1
fi

# 4. REVIEW (fresh context, read-only)
move in-qa in-review
git diff main...HEAD > "logs/diff-$ISSUE.patch"
REVIEW=$(agent review "Use the reviewer subagent. Review the change in logs/diff-$ISSUE.patch against issue #$ISSUE.
Issue text:
$BODY")
echo "$REVIEW" > "logs/review-$ISSUE.md"
echo "$REVIEW"

# 5. Hand over to a human
if grep -q "VERDICT: APPROVE" <<< "$REVIEW"; then
  git push -q -u origin "$BRANCH"
  gh pr create --base main --head "$BRANCH" --title "$TITLE" \
    --body "Closes #$ISSUE

Built, tested and reviewed by the Claude Code agent pipeline.

### Reviewer notes
$REVIEW" >/dev/null
  say "PR opened. A human reviews and merges."
  gh pr view "$BRANCH" --web || true
else
  move in-review changes-requested
  gh issue comment "$ISSUE" --body "Reviewer agent requested changes:

$REVIEW" >/dev/null
  say "Reviewer asked for changes. Comment posted on the issue."
fi

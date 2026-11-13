# Testing rules
- Use the built-in node:test and node:assert modules only.
- One test file per module: test/<module>.test.js
- Test names describe behaviour: "rejects rating outside 1-5", not "test2".
- Cover the happy path, one invalid input and one edge case (empty data).

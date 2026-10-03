// Prints a quick summary of all feedback.
const data = require('../data/feedback.json');

const entries = data.entries;
const total = entries.reduce((sum, f) => sum + f.rating, 0);

console.log(`Responses: ${entries.length}`);
console.log(`Average rating: ${(total / entries.length).toFixed(1)}`);

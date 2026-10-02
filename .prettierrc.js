/** @type {import('prettier').Config} */
module.exports = {
  // Only options that DIVERGE from Prettier's defaults — restating a default is noise.
  arrowParens: 'avoid', // default: 'always'
  singleQuote: true, // default: false
  printWidth: 100, // default: 80 — the width this codebase was written to
};

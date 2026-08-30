// Backend-local ESLint config. Without it, `npx eslint .` walked up and
// loaded the frontend's eslint.config.js from the parent directory, which
// knows only browser globals — so every `require`/`Buffer`/`module` in the
// API was flagged and lint has never actually passed here.
//
// Flat-config format (ESLint 9 layout, supported by the installed 8.57 with
// ESLINT_USE_FLAT_CONFIG). Globals are listed inline rather than via the
// `globals` package to avoid a new dependency.

const NODE_GLOBALS = {
  require: "readonly",
  module: "readonly",
  exports: "readonly",
  process: "readonly",
  Buffer: "readonly",
  console: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
  fetch: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  crypto: "readonly",
  __dirname: "readonly",
  __filename: "readonly",
};

const JEST_GLOBALS = {
  describe: "readonly",
  it: "readonly",
  test: "readonly",
  expect: "readonly",
  beforeEach: "readonly",
  afterEach: "readonly",
  beforeAll: "readonly",
  afterAll: "readonly",
  jest: "readonly",
};

export default [
  {
    ignores: ["node_modules/", "coverage/", "eslint.config.js"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: NODE_GLOBALS,
    },
    rules: {
      // Matches the existing codebase style (unused args in express handlers).
      "no-unused-vars": ["error", { args: "none" }],
    },
  },
  {
    files: ["tests/**/*.js", "dbprobe.js", "prisma/seed.js", "scripts/**/*.js"],
    languageOptions: {
      globals: { ...NODE_GLOBALS, ...JEST_GLOBALS },
    },
  },
];

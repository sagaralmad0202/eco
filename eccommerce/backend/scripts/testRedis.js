const { spawnSync } = require("child_process");
const path = require("path");

if (!process.env.TEST_REDIS_URL) {
  console.error(
    "Set TEST_REDIS_URL to a dedicated real Redis instance before running test:redis.",
  );
  process.exit(1);
}
const result = spawnSync(
  process.execPath,
  [
    path.resolve(__dirname, "../node_modules/jest/bin/jest.js"),
    "--runInBand",
    "tests/redis.integration.test.js",
    ...process.argv.slice(2),
  ],
  { cwd: path.resolve(__dirname, ".."), stdio: "inherit" },
);
if (result.error) {
  console.error(
    "Could not start Redis integration tests:",
    result.error.message,
  );
}
process.exit(result.status ?? 1);

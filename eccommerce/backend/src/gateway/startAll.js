const { spawn } = require("child_process");
const path = require("path");

const CORE_PORT = process.env.CORE_PORT || "5001";
const GATEWAY_PORT = process.env.GATEWAY_PORT || "5000";

console.log("\x1b[36m%s\x1b[0m", "==================================================");
console.log("\x1b[36m%s\x1b[0m", "  Starting E-Commerce Platform with API Gateway   ");
console.log("\x1b[36m%s\x1b[0m", "==================================================");
console.log(`  API Gateway:  http://localhost:${GATEWAY_PORT}`);
console.log(`  Core Backend: http://localhost:${CORE_PORT}`);
console.log(`  Health Check: http://localhost:${GATEWAY_PORT}/gateway/health\n`);

const backendDir = path.resolve(__dirname, "../..");

// 1. Spawn Core Backend on CORE_PORT (5001)
const coreProcess = spawn("node", [path.resolve(__dirname, "../server.js")], {
  cwd: backendDir,
  env: {
    ...process.env,
    PORT: CORE_PORT,
    PUBLIC_API_ORIGIN: `http://localhost:${GATEWAY_PORT}`,
  },
  stdio: ["inherit", "pipe", "pipe"],
});

prefixOutput(coreProcess.stdout, "\x1b[32m[Core]\x1b[0m");
prefixOutput(coreProcess.stderr, "\x1b[31m[Core ERR]\x1b[0m");

// 2. Spawn Gateway on GATEWAY_PORT (5000)
const gatewayProcess = spawn("node", [path.resolve(__dirname, "gateway.server.js")], {
  cwd: backendDir,
  env: {
    ...process.env,
    GATEWAY_PORT: GATEWAY_PORT,
    UPSTREAM_CORE_URL: `http://127.0.0.1:${CORE_PORT}`,
  },
  stdio: ["inherit", "pipe", "pipe"],
});

prefixOutput(gatewayProcess.stdout, "\x1b[34m[Gateway]\x1b[0m");
prefixOutput(gatewayProcess.stderr, "\x1b[31m[Gateway ERR]\x1b[0m");

function prefixOutput(stream, prefix) {
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep last partial line in buffer
    for (const line of lines) {
      if (line.trim()) {
        console.log(`${prefix} ${line}`);
      }
    }
  });
}

function handleShutdown(signal) {
  console.log(`\n\x1b[33mReceived ${signal}, gracefully shutting down processes...\x1b[0m`);
  try {
    coreProcess.kill(signal);
  } catch {}
  try {
    gatewayProcess.kill(signal);
  } catch {}
  setTimeout(() => process.exit(0), 1000);
}

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

coreProcess.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\x1b[31m[Core] Exited with code ${code}\x1b[0m`);
  }
});

gatewayProcess.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\x1b[31m[Gateway] Exited with code ${code}\x1b[0m`);
  }
});

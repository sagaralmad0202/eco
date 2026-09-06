const crypto = require("crypto");
const ipaddr = require("ipaddr.js");
const env = require("../../config/env");

function normalizeIp(value) {
  try {
    const address = ipaddr.process(value);
    if (address.kind() === "ipv4") return address.toString();
    // IPv6 privacy addresses in the same /64 must not mint fresh quotas.
    const bytes = address.toByteArray();
    bytes.fill(0, 8);
    return `${ipaddr.fromByteArray(bytes).toNormalizedString()}/64`;
  } catch {
    return "unknown";
  }
}
function identityDigest(type, value) {
  return crypto
    .createHmac("sha256", env.RATE_LIMIT_KEY_SECRET || env.JWT_ACCESS_SECRET)
    .update(JSON.stringify([type, value]))
    .digest("hex");
}
function makeKey(policy, identity) {
  return `${env.RATE_LIMIT_NAMESPACE}:rl:v1:${policy}:${identity}`;
}
module.exports = { normalizeIp, identityDigest, makeKey };

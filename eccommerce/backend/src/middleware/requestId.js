// Attaches a request id to every request and echoes it back as a header.
//
// When a customer reports "my order failed at 14:32", the only reliable way
// to find that exact request across auth, order and payment log lines is a
// shared id. Honour an inbound X-Request-Id when a proxy or the frontend
// already set one, so a trace survives across service boundaries.

const { randomUUID } = require("crypto");

module.exports = function requestId(req, res, next) {
  const inbound = req.headers["x-request-id"];

  // Only trust a client-supplied id if it looks like one. An unbounded header
  // value would otherwise end up in every log line, and log injection via a
  // newline in a header is a real technique.
  const id =
    typeof inbound === "string" && /^[\w-]{8,64}$/.test(inbound)
      ? inbound
      : randomUUID();

  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
};

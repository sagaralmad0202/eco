// Swagger UI, served from the OpenAPI spec next to this file.
//
// Deliberately defensive: a malformed or missing spec must never stop the API
// from serving traffic. Documentation going down is an inconvenience; the
// storefront going down because of it is an outage.

const path = require("path");
const fs = require("fs");

const env = require("../config/env");
const logger = require("../lib/logger");

const SPEC_PATH = path.join(__dirname, "openapi.yaml");

function mountDocs(app) {
  if (!fs.existsSync(SPEC_PATH)) {
    logger.warn("OpenAPI spec not found — /docs will not be served");
    return;
  }

  try {
    // Required lazily so a missing optional dependency degrades to "no docs"
    // rather than a boot crash.
    const swaggerUi = require("swagger-ui-express");
    const YAML = require("yamljs");

    const spec = YAML.load(SPEC_PATH);

    // The spec ships with a relative server URL so it works on any host.
    // Point it at wherever this instance actually runs.
    spec.servers = [{ url: `http://localhost:${env.PORT}/api` }];

    app.use(
      "/docs",
      swaggerUi.serve,
      swaggerUi.setup(spec, {
        customSiteTitle: "E-commerce API",
        swaggerOptions: { persistAuthorization: true },
      })
    );

    // The raw spec, for client generators and Postman import.
    app.get("/openapi.yaml", (req, res) => res.type("yaml").sendFile(SPEC_PATH));

    logger.info("API docs mounted at /docs");
  } catch (err) {
    logger.error({ err }, "Failed to mount API docs — continuing without them");
  }
}

module.exports = { mountDocs };

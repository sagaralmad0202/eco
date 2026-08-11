const env = require("../config/env");

function publicMediaUrl(value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;

  const path = value.startsWith("/") ? value : `/${value}`;
  return new URL(path, `${env.PUBLIC_API_ORIGIN}/`).toString();
}

module.exports = publicMediaUrl;

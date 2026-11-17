const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format an amount for display in Indian rupees without changing its value. */
export function formatInr(value) {
  const raw = typeof value === "number"
    ? value
    : String(value ?? "").replace(/,/g, "").replace(/[^\d.-]/g, "");
  const amount = typeof raw === "number" ? raw : Number(raw);

  return INR_FORMATTER.format(Number.isFinite(amount) ? amount : 0);
}

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a product or order amount in Indian rupees without changing its value. */
export function formatInr(value: unknown): string {
  const raw = typeof value === 'number' ? value : String(value ?? '').replace(/,/g, '').replace(/[^\d.-]/g, '');
  const amount = typeof raw === 'number' ? raw : Number(raw);

  return Number.isFinite(amount) ? INR_FORMATTER.format(amount) : INR_FORMATTER.format(0);
}

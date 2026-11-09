export function formatCurrency(value: number): string {
  const absolute = Math.abs(value);
  const formatted = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absolute);
  return `Rp ${value < 0 ? "-" : ""}${formatted}`;
}

export function formatQty(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

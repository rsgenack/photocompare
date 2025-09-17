export function formatNumber(value) {
  const n = typeof value === 'number' ? value : Number(value || 0);
  if (Number.isNaN(n)) return '0';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));
}



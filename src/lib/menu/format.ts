/** Format pence as GBP display string, e.g. 1250 → "£12.50" */
export function formatPricePence(pence: number): string {
  const pounds = pence / 100;
  if (Number.isInteger(pounds)) {
    return `£${pounds}`;
  }
  return `£${pounds.toFixed(2)}`;
}

export function parsePriceToPence(price: string): number {
  const cleaned = price.replace(/£|,/g, "").trim();
  return Math.round(parseFloat(cleaned) * 100);
}

export function priceRangeLabel(variants: { pricePence: number }[]): string | undefined {
  if (variants.length <= 1) {
    return variants[0] ? formatPricePence(variants[0].pricePence) : undefined;
  }
  const prices = variants.map((v) => v.pricePence);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return formatPricePence(min);
  return `${formatPricePence(min)} – ${formatPricePence(max)}`;
}

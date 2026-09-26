const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** 82500 → "$825", 82550 → "$825.50". Money is always stored in integer cents. */
export function formatCents(cents: number): string {
  const text = usd.format(cents / 100);
  return text.endsWith(".00") ? text.slice(0, -3) : text;
}

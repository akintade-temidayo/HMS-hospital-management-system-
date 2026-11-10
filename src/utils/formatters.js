export function formatDate(value, locale = "en-NG") {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
}
export function formatCurrency(value, currency = "NGN", locale = "en-NG") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

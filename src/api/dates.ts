export function utc(value: string): string {
  return /(Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`;
}

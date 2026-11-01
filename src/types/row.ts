/** A raw row from Supabase (or local storage) before mapping to a model. */
export type Row = Record<string, unknown>;

export function requireString(row: Row, key: string): string {
  const value = row[key];
  if (typeof value !== 'string') {
    throw new Error(`Expected "${key}" to be a string`);
  }
  return value;
}

export function optionalString(row: Row, key: string): string | null {
  const value = row[key];
  return typeof value === 'string' ? value : null;
}

export function stringOr(row: Row, key: string, fallback: string): string {
  return optionalString(row, key) ?? fallback;
}

export function numberOr(row: Row, key: string, fallback: number): number {
  const value = row[key];
  return typeof value === 'number' ? value : fallback;
}

export function optionalNumber(row: Row, key: string): number | null {
  const value = row[key];
  return typeof value === 'number' ? value : null;
}

export function booleanOr(row: Row, key: string, fallback: boolean): boolean {
  const value = row[key];
  return typeof value === 'boolean' ? value : fallback;
}

export function stringArray(row: Row, key: string): string[] {
  const value = row[key];
  return Array.isArray(value) ? value.map(String) : [];
}

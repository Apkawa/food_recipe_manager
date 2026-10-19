/** Deep-clone a plain object via JSON round-trip (port of apps/web utils). */
export function cloneDeep<T extends object>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function isArray(x: unknown): x is unknown[] {
  return Array.isArray(x);
}

export function isNumber(x: unknown): x is number {
  return typeof x === "number";
}

export function isString(x: unknown): x is string {
  return typeof x === "string";
}

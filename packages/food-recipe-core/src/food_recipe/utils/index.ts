export {round} from './number';
/** Object.keys typed to return only string keys. */
export const keys = Object.keys as <T>(o: T) => Extract<keyof T, string>[];
/** Object.entries with values narrowed to their non-undefined type. */
export const entries = Object.entries as <T>(
  o: T,
) => [Extract<keyof T, string>, Exclude<T[keyof T], undefined>][];
/** Object.values with values narrowed to their non-undefined type. */
export const values = Object.values as <T>(o: T) => Exclude<T[keyof T], undefined>[];

/**
 * Clean up a raw recipe line for pattern matching.
 *
 * Trims the text, strips leading/trailing non-alphanumeric decorations and
 * collapses runs of spaces/tabs into single spaces.
 *
 * @param t - Raw line from the recipe text.
 * @returns The normalized line.
 */
export function stripLine(t: string): string {
  t = t.trim();
  t = t.replace(/^(?:[^\p{L}\p{N}()%]+)?(.+?)(?:[^\p{L}\p{N}()%]+)?$/gmu, '$1');
  t = t.replace(/[\p{Zs}\t]+/gmu, ' ');
  return t;
}

/** Union of all keys across a union type (distributive keyof). */
export type KeysOfUnion<T> = T extends T ? keyof T : never;
/** Module-local ReadonlyArray view that guarantees an includes method. */
export interface ReadonlyArray<T> {
  includes<U>(x: U & (T & U extends never ? never : unknown)): boolean;
}

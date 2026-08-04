import {parseVulgars, toDecimal} from './vulgar-fractions';
import {stripLine} from './index';

/** Matches vulgar fraction characters (Unicode No) or "a/b" fractions. */
export const VULGAR_LETTER_REGEXP = /(?:\p{No}|\d+\s*\/\s*\d+)/u;

/**
 * Round a number to a fixed number of decimal places.
 *
 * @param n - Number to round.
 * @param parts - Decimal places to keep; defaults to 2.
 * @returns The rounded number, e.g. round(3.14159) is 3.14.
 */
export function round(n: number, parts = 2): number {
  const i = Math.pow(10, parts);
  return Math.round(n * i) / i;
}

/**
 * Parse a quantity string into a number, supporting vulgar fractions and commas.
 *
 * Accepts plain decimals ("1.5", "1,5"), vulgar letters (½, ⅓) and "a/b"
 * fractions; the result is rounded to 2 decimal places.
 *
 * @param s - Raw quantity text from a recipe line.
 * @returns The parsed number, or null when the text is not numeric.
 */
export function parseNumber(s: string): number | null {
  if (VULGAR_LETTER_REGEXP.test(s)) {
    s = stripLine(s).replace(/\p{Zs}/gu, '');
    s = parseVulgars(s);
    s = toDecimal(s);
  }
  const n = parseFloat(s.replace(',', '.'));
  if (!isNaN(n)) {
    return round(n, 2);
  }
  return null;
}

import {parseVulgars, toDecimal} from './vulgar-fractions';
import {round, stripLine} from './index';

export const VULGAR_LETTER_REGEXP = /(?:\p{No}|\d+\s*\/\s*\d+)/u;

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
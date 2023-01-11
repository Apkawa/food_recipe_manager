import {parseVulgars, toDecimal} from '@app/utils/vulgar-fractions';
import {stripLine} from '@app/utils/index';

export const VULGAR_LETTER_REGEXP = /(?:\p{No}|\d+\s*\/\s*\d+)/u;

export function parseNumber(s: string): number | null {
  if (VULGAR_LETTER_REGEXP.test(s)) {
    s = stripLine(s).replace(/\p{Zs}/gu, '');
    s = parseVulgars(s);
    s = toDecimal(s);
  }
  const n = parseFloat(s.replace(',', '.'));
  if (!isNaN(n)) {
    return n;
  }
  return null;
}

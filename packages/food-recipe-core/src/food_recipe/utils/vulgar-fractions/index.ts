const VULGAR_MAP: Record<string, number> = {
  '¼': 0.25,
  '½': 0.5,
  '¾': 0.75,
  '⅐': 1 / 7,
  '⅑': 1 / 9,
  '⅒': 0.1,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '⅕': 0.2,
  '⅖': 0.4,
  '⅗': 0.6,
  '⅘': 0.8,
  '⅙': 1 / 6,
  '⅚': 5 / 6,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
};

const DECIMAL_MAP: Record<number, string> = Object.fromEntries(
  Object.entries(VULGAR_MAP).map(([vulgar, decimal]) => [decimal, vulgar]),
);

const FRACTION_REGEXP = new RegExp(/^\d+\/\d+/);

const DECIMAL_REGEXP = new RegExp(/^\d*\.+\d*$/);

const hasMapping = (value: string | number) => {
  if (typeof value === 'string') {
    return Object.keys(VULGAR_MAP).includes(value);
  }

  if (typeof value === 'number') {
    return Object.keys(DECIMAL_MAP).includes(String(value));
  }

  return false;
};

/** Convert a decimal to its vulgar fraction glyph when one is known. */
export const toVulgar = (decimal: number) =>
  hasMapping(decimal) ? DECIMAL_MAP[decimal] : decimal.toString();

/** Convert a vulgar fraction glyph or "a/b" text back to a decimal string. */
export const toDecimal = (value: string) =>
  hasMapping(value) ? VULGAR_MAP[value].toString() : value;

/** Replace recognizable fractions in a string with vulgar fraction glyphs. */
export const parseVulgars = (str: string) => {
  const splitStr = str.split(' ');

  return splitStr
    .map((substr) => {
      if (FRACTION_REGEXP.test(substr)) {
        const [a, b] = substr.split('/');

        const decimal = parseInt(a, 10) / parseInt(b, 10);

        return hasMapping(decimal) ? toVulgar(decimal) : substr;
      }

      if (DECIMAL_REGEXP.test(substr)) {
        const [whole, fraction] = substr.split('.');
        const decimal = parseFloat(`.${fraction}`);
        const vulgar = toVulgar(decimal);

        return parseInt(whole, 10) ? `${whole} ${vulgar}` : vulgar;
      }

      return substr;
    })
    .join(' ');
};

/**
 * Split a number into its integer part and a vulgar fraction glyph.
 *
 * Matches common fractions (½, ⅓, ...) within a 0.01 tolerance of the decimal
 * part, e.g. 4.33 -> ['4', '⅓'].
 *
 * @param n - Number to decompose.
 * @returns [integerPart, vulgarGlyph], or null when no fraction matches.
 */
export const extractVulgarFromNumber = (n: number): string[] | null => {
  // Extract decimal = 4.33 % 1 => 0.33
  const decimalPart = n % 1;
  const displayNumber = n.toString();
  for (const [d, f] of Object.entries(VULGAR_MAP)) {
    if (Math.abs((decimalPart - f) % 1) < 0.01) {
      return [`${Number.parseInt(displayNumber) || ''}`, d];
    }
  }
  return null;
};

/**
 * Format a number with a vulgar fraction when one is known (4.5 -> "4½").
 *
 * @param n - Number to format.
 * @returns Display string; the plain decimal string when no fraction matches.
 */
export const numberToVulgar = (n: number): string => {
  const vulgarNumber = extractVulgarFromNumber(n);
  if (vulgarNumber) {
    return vulgarNumber.join('');
  }
  return n.toString();
};

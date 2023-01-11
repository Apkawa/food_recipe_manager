export default function isRegexp(value: unknown): value is RegExp {
  return toString.call(value) === '[object RegExp]';
}

/**
 * For multiline regexps
 */
export function mRegExp(regExps: (RegExp | string)[], flags?: string): RegExp {
  return RegExp(
    regExps
      .map(function (r) {
        if (isRegexp(r)) {
          return r.source;
        }
        return r;
      })
      .join(''),
    flags,
  );
}

export function round(n: number, parts = 2): number {
  const i = Math.pow(10, parts);
  return Math.round(n * i) / i;
}

export const keys = Object.keys as <T>(o: T) => Extract<keyof T, string>[];
export const entries = Object.entries as <T>(
  o: T,
) => [Extract<keyof T, string>, Exclude<T[keyof T], undefined>][];
export const values = Object.values as <T>(o: T) => Exclude<T[keyof T], undefined>[];

export function stripLine(t: string): string {
  t = t.trim();
  t = t.replace(/^(?:[^\p{L}\p{N}]+)?(.+?)(?:[^\p{L}\p{N}]+)?$/gmu, '$1');
  t = t.replace(/\p{Zs}+/gmu, ' ');
  return t;
}
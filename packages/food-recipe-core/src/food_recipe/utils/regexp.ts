export default function isRegexp(value: unknown): value is RegExp {
  return {}.toString.call(value) === '[object RegExp]';
}

/**
 * For multiline regexps
 */
export function mRegExp(regExps: (RegExp | string)[], flags?: string): RegExp {
  return RegExp(joinRegExp(regExps), flags);
}

export function groupRegExp(
  regexps: (RegExp | string)[],
  options: {flags?: string; name?: string} = {flags: 'gum'},
): RegExp {
  const {flags, name} = options;
  return mRegExp([name ? `(?<${name}` : '(?:', joinRegExp(regexps, '|'), ')'], flags);
}

export function joinRegExp(regexps: (RegExp | string)[], separator = '') {
  return regexps
    .map(function (r) {
      if (isRegexp(r)) {
        return r.source;
      }
      return r;
    })
    .join(separator || '');
}

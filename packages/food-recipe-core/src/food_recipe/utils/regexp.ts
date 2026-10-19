/** Type guard checking whether a value is a RegExp instance. */
export default function isRegexp(value: unknown): value is RegExp {
  return {}.toString.call(value) === "[object RegExp]";
}

/**
 * Build one RegExp from string/RegExp parts, joining their sources.
 *
 * @param regExps - Parts to join (sources of RegExps are extracted).
 * @param flags - Flags applied to the combined pattern, e.g. 'u' or 'gum'.
 * @returns The combined RegExp.
 */
export function mRegExp(regExps: (RegExp | string)[], flags?: string): RegExp {
  return RegExp(joinRegExp(regExps), flags);
}

/**
 * Join regexp parts into a single non-capturing (or named) group.
 *
 * @param regexps - Parts to wrap.
 * @param options - Flags for the result and an optional named-group name.
 * @returns The grouped RegExp.
 */
export function groupRegExp(
  regexps: (RegExp | string)[],
  options: { flags?: string; name?: string } = { flags: "gum" },
): RegExp {
  const { flags, name } = options;
  return mRegExp([name ? `(?<${name}` : "(?:", joinRegExp(regexps, "|"), ")"], flags);
}

/**
 * Concatenate regexp sources/strings into one pattern string.
 *
 * @param regexps - Parts to join.
 * @param separator - String inserted between parts; defaults to none.
 * @returns The joined pattern source.
 */
export function joinRegExp(regexps: (RegExp | string)[], separator = "") {
  return regexps
    .map((r) => {
      if (isRegexp(r)) {
        return r.source;
      }
      return r;
    })
    .join(separator || "");
}

import type { IconProps } from "./base";
import { strokeSvgProps } from "./base";

/** Render a check (tick) icon. */
export function CheckIcon(props: IconProps) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: decorative icon (aria-hidden by default)
    <svg {...strokeSvgProps(props)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

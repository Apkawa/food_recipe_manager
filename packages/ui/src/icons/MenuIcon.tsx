import type { IconProps } from "./base";
import { strokeSvgProps } from "./base";

/** Render a menu (hamburger) icon. */
export function MenuIcon(props: IconProps) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: decorative icon (aria-hidden by default)
    <svg {...strokeSvgProps(props)}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

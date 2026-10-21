import type { IconProps } from "./base";
import { strokeSvgProps } from "./base";

/** Render the system theme icon: a circle split diagonally, one half filled. */
export function SystemIcon(props: IconProps) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: decorative icon (aria-hidden by default)
    <svg {...strokeSvgProps(props)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M4.93 4.93 19.07 19.07A10 10 0 0 1 4.93 4.93Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

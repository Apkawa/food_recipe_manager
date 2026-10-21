import type { IconProps } from "./base";
import { strokeSvgProps } from "./base";

/** Render a share icon (three connected nodes). */
export function ShareIcon(props: IconProps) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: decorative icon (aria-hidden by default)
    <svg {...strokeSvgProps(props)}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  );
}

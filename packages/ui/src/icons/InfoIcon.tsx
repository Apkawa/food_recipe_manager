import type { IconProps } from "./base";
import { strokeSvgProps } from "./base";

/** Render an info (circle with i) icon. */
export function InfoIcon(props: IconProps) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: decorative icon (aria-hidden by default)
    <svg {...strokeSvgProps(props)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

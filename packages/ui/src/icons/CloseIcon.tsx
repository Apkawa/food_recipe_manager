import type { IconProps } from "./base";
import { strokeSvgProps } from "./base";

/** Render a close (X) icon. */
export function CloseIcon(props: IconProps) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: decorative icon (aria-hidden by default)
    <svg {...strokeSvgProps(props)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

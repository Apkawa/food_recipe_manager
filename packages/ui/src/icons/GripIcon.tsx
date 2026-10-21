import type { IconProps } from "./base";
import { fillSvgProps } from "./base";

/** Render a grip-dots drag-handle icon (filled). */
export function GripIcon(props: IconProps) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: decorative icon (aria-hidden by default)
    <svg {...fillSvgProps(props)}>
      <circle cx="9" cy="6" r="1.3" />
      <circle cx="15" cy="6" r="1.3" />
      <circle cx="9" cy="12" r="1.3" />
      <circle cx="15" cy="12" r="1.3" />
      <circle cx="9" cy="18" r="1.3" />
      <circle cx="15" cy="18" r="1.3" />
    </svg>
  );
}

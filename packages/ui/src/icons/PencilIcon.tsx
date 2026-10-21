import type { IconProps } from "./base";
import { strokeSvgProps } from "./base";

/** Render a pencil (edit) icon. */
export function PencilIcon(props: IconProps) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: decorative icon (aria-hidden by default)
    <svg {...strokeSvgProps(props)}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

import { type ReactNode, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
}

/**
 * Full-screen overlay modal.
 * Port of apps/web/src/components/ui/UiModal.vue — clicking the dimmed
 * overlay (not the content) closes it.
 */
function Modal({ open, onClose, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  if (!open) {
    return null;
  }

  const onClickOverlay = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: parity with UiModal.vue overlay click-to-close
    // biome-ignore lint/a11y/useKeyWithClickEvents: parity with UiModal.vue (no keyboard handler in the Vue original)
    <div ref={overlayRef} className="modal modal-overlay" onClick={onClickOverlay}>
      <div className="modal-content">{children}</div>
    </div>
  );
}

export default Modal;

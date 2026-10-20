import { type ReactNode, useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name of the dialog (rendered as `aria-label`). */
  ariaLabel: string;
  children?: ReactNode;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Full-screen overlay modal, implemented as an accessible dialog:
 * `role="dialog"` + `aria-modal="true"`, Escape closes it, focus moves
 * into the dialog on open (and back to the trigger on close), and Tab
 * cycles within the dialog. Clicking the dimmed overlay also closes it
 * (port of apps/web/src/components/ui/UiModal.vue behavior).
 */
function Modal({ open, onClose, ariaLabel, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // On open: remember the trigger and move focus into the dialog; on
  // close (unmount): return focus to the trigger.
  useEffect(() => {
    if (!open) {
      return;
    }
    previouslyFocused.current = (document.activeElement as HTMLElement | null) ?? null;
    dialogRef.current?.focus();
    return () => {
      previouslyFocused.current?.focus();
    };
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab") {
      return;
    }
    // Minimal focus trap: keep Tab/Shift+Tab cycling inside the dialog.
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    const first = focusable[0] ?? dialog;
    const last = focusable[focusable.length - 1] ?? dialog;
    const active = document.activeElement;
    const inside = active instanceof HTMLElement && dialog.contains(active);
    if (e.shiftKey && (active === first || !inside)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !inside)) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!open) {
    return null;
  }

  const onClickOverlay = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={dialogRef}
      className="modal modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      tabIndex={-1}
      onClick={onClickOverlay}
      onKeyDown={onKeyDown}
    >
      <div className="modal-content">{children}</div>
    </div>
  );
}

export default Modal;

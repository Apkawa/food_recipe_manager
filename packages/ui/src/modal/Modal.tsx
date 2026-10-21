import { type KeyboardEvent, type MouseEvent, type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "../button";
import { Card } from "../card";
import { CloseIcon } from "../icons";

/** Props for the {@link Modal} dialog. */
export type ModalProps = {
  /** Whether the dialog is open. */
  open: boolean;
  /** Close the dialog (Escape, backdrop click, close button). */
  onClose: () => void;
  /** Accessible name of the dialog (rendered as `aria-label`). */
  ariaLabel: string;
  /** Dialog content, rendered inside a {@link Card}. */
  children?: ReactNode;
};

/** Selector for the focus trap: the elements Tab may land on. */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Render a centered, full-screen overlay dialog.
 *
 * @remarks The dialog is portaled to `document.body` and exposed as
 * `role="dialog"` + `aria-modal="true"`: Escape closes it, focus moves
 * into the dialog on open (and back to the previously focused element
 * on close), Tab cycles within the dialog, and clicking the dimmed
 * backdrop closes it. Content is surfaced in a {@link Card} with a
 * close button in its top-right corner.
 *
 * @param props - Modal properties.
 */
export function Modal({ open, onClose, ariaLabel, children }: ModalProps) {
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

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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
    const inside = active instanceof HTMLElement && dialog.contains(active) && active !== dialog;
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

  const onClickBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return createPortal(
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      tabIndex={-1}
      onClick={onClickBackdrop}
      onKeyDown={onKeyDown}
    >
      <Card className="relative w-full max-w-lg p-4" onClick={(e) => e.stopPropagation()}>
        <IconButton
          variant="ghost"
          size="md"
          aria-label="Закрыть"
          className="absolute right-0 top-0"
          onClick={onClose}
        >
          <CloseIcon className="h-5 w-5" />
        </IconButton>
        {children}
      </Card>
    </div>,
    document.body,
  );
}

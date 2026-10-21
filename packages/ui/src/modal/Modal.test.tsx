import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Modal } from "./index";

afterEach(() => {
  cleanup();
});

describe("Modal", () => {
  it("renders nothing when open is false", () => {
    render(
      <Modal open={false} onClose={vi.fn()} ariaLabel="Поделиться">
        <p>content</p>
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.querySelector("[role='dialog']")).toBeNull();
  });

  it("renders an accessible dialog with aria-label when open", () => {
    render(
      <Modal open onClose={vi.fn()} ariaLabel="Поделиться">
        <p>content</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-label")).toBe("Поделиться");
  });

  it("renders children inside a Card surface", () => {
    render(
      <Modal open onClose={vi.fn()} ariaLabel="Поделиться">
        <p>content</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    const card = dialog.querySelector(".bg-card");
    expect(card, "card inside the dialog").not.toBeNull();
    expect(card?.className).toContain("rounded-card");
    expect(card?.className).toContain("border border-border");
    expect(card?.textContent).toContain("content");
  });

  it("calls onClose from the close icon button", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} ariaLabel="Поделиться">
        <p>content</p>
      </Modal>,
    );
    const close = screen.getByRole("button", { name: "Закрыть" });
    expect(close.querySelector("svg")).not.toBeNull();
    fireEvent.click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape keydown", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} ariaLabel="Поделиться">
        <p>content</p>
      </Modal>,
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on backdrop click but not on card click", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} ariaLabel="Поделиться">
        <p>content</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    const card = dialog.querySelector(".bg-card") as HTMLElement;

    fireEvent.click(card);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("traps Tab focus within the dialog and wraps at the edges", () => {
    render(
      <Modal open onClose={vi.fn()} ariaLabel="Поделиться">
        <button type="button">внутри</button>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    const close = screen.getByRole("button", { name: "Закрыть" });
    const inside = screen.getByRole("button", { name: "внутри" });

    dialog.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(close);

    // Shift+Tab at the first focusable wraps to the last one.
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(inside);

    // Tab at the last focusable wraps back to the first one.
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(close);
  });

  it("restores focus to the previously focused element on close", () => {
    const { rerender } = render(
      <div>
        <button type="button">триггер</button>
        <Modal open={false} onClose={vi.fn()} ariaLabel="Поделиться">
          <p>content</p>
        </Modal>
      </div>,
    );
    const trigger = screen.getByRole("button", { name: "триггер" });
    trigger.focus();
    rerender(
      <div>
        <button type="button">триггер</button>
        <Modal open onClose={vi.fn()} ariaLabel="Поделиться">
          <p>content</p>
        </Modal>
      </div>,
    );
    const dialog = screen.getByRole("dialog");
    expect(document.activeElement).toBe(dialog);

    rerender(
      <div>
        <button type="button">триггер</button>
        <Modal open={false} onClose={vi.fn()} ariaLabel="Поделиться">
          <p>content</p>
        </Modal>
      </div>,
    );
    expect(document.activeElement).toBe(trigger);
  });
});

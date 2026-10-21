import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CloseIcon } from "../icons";
import { Sidebar, SidebarBackdrop, SidebarLink } from "./index";

/** Get the rendered `<aside>` from a render container. */
function asideOf(result: { container: HTMLElement }) {
  return result.container.querySelector("aside") as HTMLElement;
}

/** Split a className into exact whitespace-separated tokens. */
function tokensOf(el: HTMLElement): string[] {
  return el.className.split(/\s+/);
}

describe("Sidebar", () => {
  it("renders the title in the header row", () => {
    const { container } = render(
      <Sidebar open onClose={() => {}} title="Калькулятор рецептов">
        <nav />
      </Sidebar>,
    );
    const title = container.querySelector(".font-extrabold") as HTMLElement;
    expect(title.textContent).toBe("Калькулятор рецептов");
    expect(tokensOf(title)).toContain("text-sm");
  });

  it("toggles the translate classes with `open`", () => {
    const { rerender, container } = render(
      <Sidebar open={false} onClose={() => {}} title="T">
        <nav />
      </Sidebar>,
    );
    const aside = asideOf({ container });
    let tokens = tokensOf(aside);
    expect(tokens).toContain("-translate-x-full");
    expect(tokens).not.toContain("translate-x-0");
    expect(tokens).toContain("lg:translate-x-0");

    rerender(
      <Sidebar open onClose={() => {}} title="T">
        <nav />
      </Sidebar>,
    );
    tokens = tokensOf(aside);
    expect(tokens).toContain("translate-x-0");
    expect(tokens).not.toContain("-translate-x-full");
  });

  it("reflects `open` in data-open", () => {
    const { rerender, container } = render(
      <Sidebar open={false} onClose={() => {}} title="T">
        <nav />
      </Sidebar>,
    );
    const aside = asideOf({ container });
    expect(aside.getAttribute("data-open")).toBe("false");

    rerender(
      <Sidebar open onClose={() => {}} title="T">
        <nav />
      </Sidebar>,
    );
    expect(aside.getAttribute("data-open")).toBe("true");
  });

  it("calls onClose from the mobile close button", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Sidebar open onClose={onClose} title="T">
        <nav />
      </Sidebar>,
    );
    const button = container.querySelector(
      'button[aria-label="Закрыть меню"]',
    ) as HTMLButtonElement;
    fireEvent.click(button);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders the footer slot in a bottom-aligned wrapper", () => {
    const { container } = render(
      <Sidebar
        open
        onClose={() => {}}
        title="T"
        footer={
          <footer>
            <span>theme controls</span>
          </footer>
        }
      >
        <nav />
      </Sidebar>,
    );
    const footerSlot = container.querySelector(".mt-auto") as HTMLElement;
    expect(footerSlot.querySelector("footer")).toBeTruthy();
  });

  it("merges className", () => {
    const { container } = render(
      <Sidebar open onClose={() => {}} title="T" className="ml-4">
        <nav />
      </Sidebar>,
    );
    const tokens = tokensOf(asideOf({ container }));
    expect(tokens).toContain("ml-4");
    expect(tokens).toContain("w-72");
    expect(tokens).toContain("lg:translate-x-0");
  });
});

describe("SidebarLink", () => {
  it("renders href, label and icon", () => {
    const { container } = render(
      <SidebarLink href="#recipes" label="Рецепты" icon={<CloseIcon />} />,
    );
    const link = container.querySelector("a") as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("#recipes");
    expect(link.textContent).toContain("Рецепты");
    // The leading icon is rendered bare (no square chip), wrapped in `shrink-0`.
    const iconWrap = container.querySelector(".shrink-0") as HTMLElement;
    expect(iconWrap).toBeTruthy();
    expect(iconWrap.querySelector("svg")).toBeTruthy();
  });

  it("adds aria-current and accent classes when active", () => {
    const { container } = render(<SidebarLink href="#home" label="Главная" active />);
    const link = container.querySelector("a") as HTMLAnchorElement;
    expect(link.getAttribute("aria-current")).toBe("page");
    const tokens = tokensOf(link);
    expect(tokens).toContain("bg-accentbg/10");
    expect(tokens).toContain("text-accent2");
    expect(tokens).toContain("font-bold");
  });

  it("omits aria-current when not active", () => {
    const { container } = render(<SidebarLink href="#home" label="Главная" />);
    const link = container.querySelector("a") as HTMLAnchorElement;
    expect(link.hasAttribute("aria-current")).toBe(false);
  });

  it("merges className", () => {
    const { container } = render(<SidebarLink href="#home" label="Главная" className="mb-2" />);
    const link = container.querySelector("a") as HTMLAnchorElement;
    const tokens = tokensOf(link);
    expect(tokens).toContain("mb-2");
    expect(tokens).toContain("hover:bg-hover");
  });
});

describe("SidebarBackdrop", () => {
  it("is hidden when not visible", () => {
    const { container } = render(<SidebarBackdrop visible={false} onClick={() => {}} />);
    const backdrop = container.querySelector("div") as HTMLDivElement;
    expect(tokensOf(backdrop)).toContain("hidden");
    expect(backdrop.getAttribute("aria-hidden")).toBe("true");
  });

  it("fires onClick when visible", () => {
    const onClick = vi.fn();
    const { container } = render(<SidebarBackdrop visible onClick={onClick} />);
    const backdrop = container.querySelector("div") as HTMLDivElement;
    expect(tokensOf(backdrop)).not.toContain("hidden");
    fireEvent.click(backdrop);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("always carries the lg:hidden class", () => {
    const { container } = render(<SidebarBackdrop visible onClick={() => {}} />);
    const backdrop = container.querySelector("div") as HTMLDivElement;
    const tokens = tokensOf(backdrop);
    expect(tokens).toContain("lg:hidden");
    expect(tokens).toContain("z-30");
  });
});

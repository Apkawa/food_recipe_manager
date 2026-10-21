import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button, IconButton, Stepper } from "./index";

describe("Button", () => {
  it("renders with primary classes by default", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.className).toContain("bg-accentbg");
    expect(button.className).toContain("text-accentcontrast");
    expect(button.className).toContain("hover:bg-accentbg2");
    expect(button.className).toContain("rounded-control");
    expect(button.className).toContain("px-4 py-2.5 text-sm");
  });

  it("applies the expected token classes for the secondary variant", () => {
    render(<Button variant="secondary">Reset</Button>);
    const button = screen.getByRole("button", { name: "Reset" });
    expect(button.className).toContain("text-muted");
    expect(button.className).toContain("hover:text-accent");
    expect(button.className).toContain("hover:underline");
    expect(button.className).not.toContain("bg-accentbg");
  });

  it("applies the expected token classes for the ghost variant", () => {
    render(<Button variant="ghost">More</Button>);
    const button = screen.getByRole("button", { name: "More" });
    expect(button.className).toContain("text-muted2");
    expect(button.className).toContain("hover:bg-hover");
    expect(button.className).toContain("hover:text-accent");
    expect(button.className).not.toContain("bg-accentbg");
  });

  it("applies the lg size classes", () => {
    render(<Button size="lg">Big</Button>);
    const button = screen.getByRole("button", { name: "Big" });
    expect(button.className).toContain("px-5 py-3 text-base");
  });

  it("disables the button when disabled", () => {
    render(<Button disabled>Nope</Button>);
    const button = screen.getByRole("button", { name: "Nope" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("fires onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Click" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("merges className", () => {
    render(<Button className="w-full">Full</Button>);
    const button = screen.getByRole("button", { name: "Full" });
    expect(button.className).toContain("w-full");
    expect(button.className).toContain("bg-accentbg");
  });
});

describe("IconButton", () => {
  it("renders with bordered classes by default", () => {
    render(<IconButton aria-label="Menu">☰</IconButton>);
    const button = screen.getByRole("button", { name: "Menu" });
    expect(button.className).toContain("rounded-full");
    expect(button.className).toContain("border border-border");
    expect(button.className).toContain("bg-card");
    expect(button.className).toContain("text-text2");
    expect(button.className).toContain("shadow-card");
  });

  it("applies the expected classes for the accent variant", () => {
    render(
      <IconButton variant="accent" aria-label="Confirm">
        ✓
      </IconButton>,
    );
    const button = screen.getByRole("button", { name: "Confirm" });
    expect(button.className).toContain("rounded-control");
    expect(button.className).toContain("bg-accentbg");
    expect(button.className).toContain("text-accentcontrast");
    expect(button.className).not.toContain("rounded-full");
  });

  it("applies the expected classes for the ghost variant", () => {
    render(
      <IconButton variant="ghost" aria-label="Edit">
        ✎
      </IconButton>,
    );
    const button = screen.getByRole("button", { name: "Edit" });
    expect(button.className).toContain("rounded-control");
    expect(button.className).toContain("text-muted2");
    expect(button.className).toContain("hover:bg-hover");
    expect(button.className).toContain("hover:text-accent");
  });

  it("uses h-11 w-11 by default and h-12 w-12 for lg", () => {
    const { rerender } = render(<IconButton aria-label="A">i</IconButton>);
    expect(screen.getByRole("button", { name: "A" }).className).toContain("h-11 w-11");
    rerender(
      <IconButton aria-label="A" size="lg">
        i
      </IconButton>,
    );
    expect(screen.getByRole("button", { name: "A" }).className).toContain("h-12 w-12");
  });

  it("fires onClick", () => {
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Go" onClick={onClick}>
        →
      </IconButton>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("Stepper", () => {
  function renderStepper(props: Partial<Parameters<typeof Stepper>[0]> = {}) {
    const onChange = vi.fn();
    const result = render(
      <Stepper
        value={5}
        onChange={onChange}
        {...props}
        ariaLabelDecrement="Dec"
        ariaLabelIncrement="Inc"
      />,
    );
    const scope = within(result.container);
    const dec = scope.getByRole("button", { name: "Dec" }) as HTMLButtonElement;
    const inc = scope.getByRole("button", { name: "Inc" }) as HTMLButtonElement;
    return { ...result, onChange, dec, inc };
  }

  it("renders the current value between two glyph buttons", () => {
    const { getByText, dec, inc } = renderStepper();
    expect(getByText("5")).toBeTruthy();
    expect(dec.textContent).toBe("−");
    expect(inc.textContent).toBe("+");
  });

  it("calls onChange with value ± step", () => {
    const { onChange, dec, inc } = renderStepper();
    fireEvent.click(inc);
    expect(onChange).toHaveBeenCalledWith(6);
    fireEvent.click(dec);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("respects a custom step", () => {
    const { onChange, dec, inc } = renderStepper({ step: 2, value: 10 });
    fireEvent.click(inc);
    expect(onChange).toHaveBeenCalledWith(12);
    fireEvent.click(dec);
    expect(onChange).toHaveBeenCalledWith(8);
  });

  it("disables the decrement button at min", () => {
    const { dec, inc } = renderStepper({ value: 0 });
    expect(dec.disabled).toBe(true);
    expect(inc.disabled).toBe(false);
  });

  it("disables the increment button at max", () => {
    const { dec, inc } = renderStepper({ value: 10, max: 10 });
    expect(inc.disabled).toBe(true);
    expect(dec.disabled).toBe(false);
  });

  it("disables decrement when stepping below min", () => {
    const { dec } = renderStepper({ value: 0, min: 1 });
    expect(dec.disabled).toBe(true);
  });

  it("merges className into the group", () => {
    const { container } = renderStepper({ className: "mx-auto" });
    const group = container.querySelector('[role="group"]');
    expect(group?.getAttribute("class")).toContain("mx-auto");
  });
});

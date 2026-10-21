import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./index";

function renderInput(props: Partial<Parameters<typeof Input>[0]> = {}) {
  const onChange = vi.fn();
  const result = render(<Input value="25" onChange={onChange} {...props} />);
  const input = result.container.querySelector("input") as HTMLInputElement;
  return { ...result, input, onChange };
}

describe("Input", () => {
  it("renders a controlled input with the default text type and sm size", () => {
    const { input } = renderInput();
    expect(input.type).toBe("text");
    expect(input.value).toBe("25");
    expect(input.className).toContain("w-16");
    expect(input.className).toContain("border border-border");
  });

  it("calls onChange with the raw string value", () => {
    const { container, onChange } = renderInput({ type: "number" });
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.type).toBe("number");
    fireEvent.change(input, { target: { value: "30" } });
    expect(onChange).toHaveBeenCalledWith("30");
  });

  it("swaps the border classes when highlighted", () => {
    const { container, rerender } = renderInput();
    expect(container.querySelector("input")?.className).toContain("border border-border");
    rerender(<Input value="25" onChange={vi.fn()} highlighted />);
    const input = container.querySelector("input");
    expect(input?.className).toContain("border-2 border-accentbg");
    expect(input?.className).not.toContain("border border-border");
  });

  it("applies w-full for the md size", () => {
    const { input } = renderInput({ size: "md" });
    expect(input.className).toContain("w-full");
    expect(input.className).not.toContain("w-16");
  });

  it("merges className into the input", () => {
    const { input } = renderInput({ className: "opacity-50" });
    expect(input.className).toContain("opacity-50");
    expect(input.className).toContain("rounded-field");
  });

  it("forwards disabled and passthrough attributes", () => {
    const { input } = renderInput({
      disabled: true,
      min: 0,
      max: 100,
      step: 5,
      inputMode: "numeric",
    });
    expect(input.disabled).toBe(true);
    expect(input.min).toBe("0");
    expect(input.max).toBe("100");
    expect(input.step).toBe("5");
    expect(input.inputMode).toBe("numeric");
  });
});

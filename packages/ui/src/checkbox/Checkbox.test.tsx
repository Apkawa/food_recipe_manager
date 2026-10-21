import { fireEvent, render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./index";

function renderCheckbox(props: Partial<Parameters<typeof Checkbox>[0]> = {}) {
  const onChange = vi.fn();
  const result = render(<Checkbox checked={false} onChange={onChange} {...props} />);
  const input = within(result.container).getByRole("checkbox") as HTMLInputElement;
  return { ...result, input, onChange };
}

describe("Checkbox", () => {
  it("renders a real, focusable checkbox input with a label", () => {
    const { container, input } = renderCheckbox({ label: "Salt" });
    expect(input.type).toBe("checkbox");
    expect(input.checked).toBe(false);
    input.focus();
    expect(document.activeElement).toBe(input);
    expect(within(container).getByText("Salt")).toBeTruthy();
  });

  it("calls onChange with true when checked and false when unchecked", () => {
    const { input, onChange, rerender } = renderCheckbox();
    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(<Checkbox checked={true} onChange={onChange} />);
    fireEvent.click(input);
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("shows the check icon only when checked", () => {
    const { container, rerender } = renderCheckbox();
    expect(container.querySelector("svg")).toBeNull();
    rerender(<Checkbox checked={true} onChange={vi.fn()} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("stroke-width")).toBe("3");
  });

  it("forwards disabled to the input", () => {
    const { input } = renderCheckbox({ disabled: true });
    expect(input.disabled).toBe(true);
  });

  it("merges className into the label", () => {
    const { container } = renderCheckbox({ className: "w-full" });
    const label = container.querySelector("label");
    expect(label?.className).toContain("w-full");
    expect(label?.className).toContain("inline-flex");
  });
});

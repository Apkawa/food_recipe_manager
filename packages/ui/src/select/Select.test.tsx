import { fireEvent, render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./index";

function renderSelect(props: Partial<Parameters<typeof Select>[0]> = {}) {
  const onChange = vi.fn();
  const result = render(
    <Select value="g" onChange={onChange} {...props}>
      <option value="g">g</option>
      <option value="ml">ml</option>
    </Select>,
  );
  const select = within(result.container).getByRole("combobox") as HTMLSelectElement;
  return { ...result, select, onChange };
}

describe("Select", () => {
  it("renders a controlled select with its options", () => {
    const { container, select } = renderSelect();
    expect(select.value).toBe("g");
    expect(
      within(container)
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toEqual(["g", "ml"]);
  });

  it("calls onChange with the selected option value", () => {
    const { select, onChange } = renderSelect();
    fireEvent.change(select, { target: { value: "ml" } });
    expect(onChange).toHaveBeenCalledWith("ml");
  });

  it("applies the sm classes by default", () => {
    const { select } = renderSelect();
    expect(select.className).toContain("rounded-field border-2 border-accentbg");
    expect(select.className).toContain("px-2 py-0.5");
  });

  it("applies the md classes for the md size", () => {
    const { select } = renderSelect({ size: "md" });
    expect(select.className).toContain("rounded-control border border-border");
    expect(select.className).toContain("px-3 py-2.5");
  });

  it("merges className and forwards disabled", () => {
    const { select } = renderSelect({ className: "w-40", disabled: true });
    expect(select.className).toContain("w-40");
    expect(select.className).toContain("bg-input");
    expect(select.disabled).toBe(true);
  });
});

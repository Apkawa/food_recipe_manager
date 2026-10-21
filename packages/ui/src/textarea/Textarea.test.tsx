import { fireEvent, render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Textarea } from "./index";

function renderTextarea(props: Partial<Parameters<typeof Textarea>[0]> = {}) {
  const onChange = vi.fn();
  const result = render(<Textarea value="100 ml water" onChange={onChange} {...props} />);
  const textarea = within(result.container).getByRole("textbox") as HTMLTextAreaElement;
  return { ...result, textarea, onChange };
}

describe("Textarea", () => {
  it("renders a controlled textarea with the base classes", () => {
    const { textarea } = renderTextarea();
    expect(textarea.value).toBe("100 ml water");
    expect(textarea.className).toContain(
      "w-full resize-y rounded-control border border-border bg-inputd",
    );
    expect(textarea.className).toContain("font-mono text-xs leading-relaxed");
  });

  it("calls onChange with the raw string value", () => {
    const { textarea, onChange } = renderTextarea();
    fireEvent.change(textarea, { target: { value: "200 ml water" } });
    expect(onChange).toHaveBeenCalledWith("200 ml water");
  });

  it("merges className and forwards passthrough attributes", () => {
    const { textarea } = renderTextarea({
      className: "min-h-40",
      rows: 8,
      placeholder: "Paste a recipe",
      disabled: true,
    });
    expect(textarea.className).toContain("min-h-40");
    expect(textarea.className).toContain("p-3");
    expect(textarea.rows).toBe(8);
    expect(textarea.placeholder).toBe("Paste a recipe");
    expect(textarea.disabled).toBe(true);
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Details, DetailsSummary } from "./index";

describe("Details", () => {
  it("renders a <details> element with its children", () => {
    render(
      <Details data-testid="details1">
        <DetailsSummary>label</DetailsSummary>
        <div>body</div>
      </Details>,
    );
    const details = screen.getByTestId("details1");
    expect(details.tagName).toBe("DETAILS");
    expect(details.querySelector("summary")).not.toBeNull();
    expect(details.textContent).toContain("body");
  });

  it("reflects the open attribute", () => {
    render(
      <Details data-testid="details2" open>
        <DetailsSummary>label</DetailsSummary>
      </Details>,
    );
    const details = screen.getByTestId("details2");
    expect(details.hasAttribute("open")).toBe(true);
  });

  it("merges Details className", () => {
    render(
      <Details data-testid="details3" className="mt-3">
        <DetailsSummary>label</DetailsSummary>
      </Details>,
    );
    expect(screen.getByTestId("details3").className).toContain("mt-3");
  });

  it("renders DetailsSummary as a <summary> with expected classes", () => {
    render(
      <Details>
        <DetailsSummary data-testid="summary1">label</DetailsSummary>
      </Details>,
    );
    const summary = screen.getByTestId("summary1");
    expect(summary.tagName).toBe("SUMMARY");
    expect(summary.className).toContain("cursor-pointer");
    expect(summary.className).toContain("list-none");
    expect(summary.className).toContain("p-4");
    expect(summary.className).toContain("text-sm font-semibold");
  });

  it("merges DetailsSummary className", () => {
    render(
      <Details>
        <DetailsSummary data-testid="summary2" className="py-2">
          label
        </DetailsSummary>
      </Details>,
    );
    expect(screen.getByTestId("summary2").className).toContain("py-2");
  });
});

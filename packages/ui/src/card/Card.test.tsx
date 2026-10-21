import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, CardHeader } from "./index";

describe("Card", () => {
  it("renders its children in a bordered surface", () => {
    render(<Card data-testid="card1">content</Card>);
    const card = screen.getByTestId("card1");
    expect(card.tagName).toBe("DIV");
    expect(card.textContent).toBe("content");
    expect(card.className).toContain("rounded-card");
    expect(card.className).toContain("border border-border");
    expect(card.className).toContain("bg-card");
    expect(card.className).toContain("shadow-card");
  });

  it("merges className and passes extra attributes through", () => {
    render(
      <Card data-testid="card2" className="mt-3" role="group">
        x
      </Card>,
    );
    const card = screen.getByTestId("card2");
    expect(card.className).toContain("mt-3");
    expect(card.className).toContain("bg-card");
    expect(card.getAttribute("role")).toBe("group");
  });

  it("renders CardHeader with the small-caps muted title style", () => {
    render(
      <Card>
        <CardHeader>Для теста</CardHeader>
      </Card>,
    );
    const header = screen.getByRole("heading", { level: 2 });
    expect(header.textContent).toBe("Для теста");
    expect(header.className).toContain("px-4 pt-4");
    expect(header.className).toContain("text-xs font-bold uppercase tracking-wider");
    expect(header.className).toContain("text-muted");
  });

  it("merges CardHeader className", () => {
    render(
      <CardHeader data-testid="header2" className="pb-2">
        Т
      </CardHeader>,
    );
    const header = screen.getByTestId("header2");
    expect(header.className).toContain("pb-2");
    expect(header.className).toContain("text-muted");
  });
});

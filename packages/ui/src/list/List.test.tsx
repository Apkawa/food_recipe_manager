import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { List, Row } from "./index";

describe("List", () => {
  it("renders a <ul> with divide classes and its rows", () => {
    render(
      <List data-testid="list1">
        <Row data-testid="row1">one</Row>
        <Row data-testid="row2">two</Row>
      </List>,
    );
    const list = screen.getByTestId("list1");
    expect(list.tagName).toBe("UL");
    expect(list.className).toContain("divide-y divide-divider");
    expect(list.querySelectorAll("li")).toHaveLength(2);
  });

  it("merges List className", () => {
    render(
      <List data-testid="list2" className="mt-3">
        <Row>one</Row>
      </List>,
    );
    const list = screen.getByTestId("list2");
    expect(list.className).toContain("mt-3");
    expect(list.className).toContain("divide-divider");
  });

  it("renders Row as a flex <li>", () => {
    render(
      <List>
        <Row data-testid="row3">item</Row>
      </List>,
    );
    const row = screen.getByTestId("row3");
    expect(row.tagName).toBe("LI");
    expect(row.className).toContain("flex items-center gap-1 px-1 py-2.5");
    expect(row.textContent).toBe("item");
  });

  it("adds highlight classes when highlighted", () => {
    render(
      <List>
        <Row data-testid="row4" highlighted>
          edited
        </Row>
      </List>,
    );
    const row = screen.getByTestId("row4");
    expect(row.className).toContain("bg-soft");
    expect(row.className).toContain("ring-1 ring-inset ring-ring");
  });

  it("does not add highlight classes by default", () => {
    render(
      <List>
        <Row data-testid="row5">plain</Row>
      </List>,
    );
    const row = screen.getByTestId("row5");
    expect(row.className).not.toContain("bg-soft");
    expect(row.className).not.toContain("ring-ring");
  });

  it("merges Row className", () => {
    render(
      <List>
        <Row data-testid="row6" className="py-3">
          x
        </Row>
      </List>,
    );
    const row = screen.getByTestId("row6");
    expect(row.className).toContain("py-3");
    expect(row.className).toContain("flex items-center");
  });
});

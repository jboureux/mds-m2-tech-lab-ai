import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Page from "./page";

test("Page component should render text", () => {
	render(<Page />);
	expect(
		screen.getByText(/To get started, edit the page\.tsx file\./i),
	).toBeDefined();
});

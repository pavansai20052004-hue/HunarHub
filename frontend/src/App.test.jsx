import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders HunarHub public navigation", () => {
  render(<App />);
  expect(screen.getByRole("link", { name: /HunarHub/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Register/i })).toBeInTheDocument();
});

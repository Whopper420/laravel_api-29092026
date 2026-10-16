import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "./Header";

describe("Header", () => {
  it("shows the logged-out state", () => {
    render(<Header user={null} onLogout={vi.fn()} />);

    expect(screen.getByText("Not logged in")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Logout" }),
    ).not.toBeInTheDocument();
  });

  it("greets a logged-in user by name", () => {
    render(<Header user={{ name: "Ann" }} onLogout={vi.fn()} />);

    expect(screen.getByText("Logged in as Ann")).toBeInTheDocument();
  });

  it("falls back to email, then to 'User'", () => {
    const { rerender } = render(
      <Header user={{ email: "ann@b.c" }} onLogout={vi.fn()} />,
    );
    expect(screen.getByText("Logged in as ann@b.c")).toBeInTheDocument();

    rerender(<Header user={{}} onLogout={vi.fn()} />);
    expect(screen.getByText("Logged in as User")).toBeInTheDocument();
  });

  it("invokes onLogout when the button is clicked", () => {
    const onLogout = vi.fn();
    render(<Header user={{ name: "Ann" }} onLogout={onLogout} />);

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});

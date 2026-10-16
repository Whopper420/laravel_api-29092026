import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PostCard from "./PostCard";
import type { Post } from "../../types";

const post: Post = { id: 42, title: "Hello", body: "World" };

describe("PostCard", () => {
  it("renders the post title, body and id", () => {
    render(<PostCard post={post} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("World")).toBeInTheDocument();
    expect(screen.getByText("Post ID: 42")).toBeInTheDocument();
  });

  it("falls back to placeholders when fields are empty", () => {
    render(<PostCard post={{ id: 1 }} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText("No title")).toBeInTheDocument();
    expect(screen.getByText("No body")).toBeInTheDocument();
  });

  it("calls onEdit with the post", () => {
    const onEdit = vi.fn();
    render(<PostCard post={post} onEdit={onEdit} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledWith(post);
  });

  it("calls onDelete with the post id", () => {
    const onDelete = vi.fn();
    render(<PostCard post={post} onEdit={vi.fn()} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith(42);
  });
});

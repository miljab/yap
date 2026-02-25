import TextEditor from "@/components/ui/TextEditor";
import { describe, vi, beforeEach, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

describe("TextEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with placeholder when empty", () => {
    render(
      <TextEditor
        onSubmit={vi.fn()}
        placeholder="What's on your mind?"
        submitButtonText="Post"
      />,
    );

    expect(screen.getByText(/what's on your mind/i)).toBeInTheDocument();
  });

  it("disables submit button when empty", () => {
    render(
      <TextEditor
        onSubmit={vi.fn()}
        placeholder="What's on your mind?"
        submitButtonText="Post"
      />,
    );

    expect(screen.getByRole("button", { name: /post/i })).toBeDisabled();
  });

  it("enables submit button when content is entered", async () => {
    render(
      <TextEditor
        onSubmit={vi.fn()}
        placeholder="What's on your mind?"
        submitButtonText="Post"
      />,
    );

    const contentArea = screen.getByLabelText(/post content/i);
    fireEvent.input(contentArea, { target: { innerText: "Hello world" } });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /post/i })).toBeEnabled();
    });
  });

  it("shows character count when content is entered", async () => {
    render(
      <TextEditor
        onSubmit={vi.fn()}
        placeholder="What's on your mind?"
        submitButtonText="Post"
        maxLength={200}
      />,
    );

    const contentArea = screen.getByLabelText(/post content/i);
    fireEvent.input(contentArea, { target: { innerText: "Hello" } });

    await waitFor(() => {
      expect(screen.getByText(/characters:/i)).toBeInTheDocument();
    });
  });

  it("calls onSubmit with content when button is clicked", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <TextEditor
        onSubmit={onSubmit}
        placeholder="What's on your mind?"
        submitButtonText="Post"
      />,
    );

    const contentArea = screen.getByLabelText(/post content/i);
    fireEvent.input(contentArea, { target: { innerText: "Test post" } });

    const postButton = screen.getByRole("button", { name: /post/i });
    fireEvent.click(postButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("Test post", []);
    });
  });

  it("clears content after successful submit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <TextEditor
        onSubmit={onSubmit}
        placeholder="What's on your mind?"
        submitButtonText="Post"
      />,
    );

    const contentArea = screen.getByLabelText(/post content/i);
    fireEvent.input(contentArea, { target: { innerText: "Test post" } });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /post/i })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: /post/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    expect(screen.getByRole("button", { name: /post/i })).toBeDisabled();
  });

  it("enables image button when allowImages is true", () => {
    render(
      <TextEditor
        onSubmit={vi.fn()}
        placeholder="What's on your mind?"
        submitButtonText="Post"
        allowImages={true}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
  });

  it("does not render image button when allowImages is false", () => {
    render(
      <TextEditor
        onSubmit={vi.fn()}
        placeholder="What's on your mind?"
        submitButtonText="Post"
        allowImages={false}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent(/post/i);
  });

  it("renders with custom submit button text", () => {
    render(
      <TextEditor
        onSubmit={vi.fn()}
        placeholder="What's on your mind?"
        submitButtonText="Share"
      />,
    );

    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
  });

  it("disables submit button while submitting", async () => {
    let resolveSubmit: (value: unknown) => void;
    const onSubmit = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    render(
      <TextEditor
        onSubmit={onSubmit}
        placeholder="What's on your mind?"
        submitButtonText="Post"
      />,
    );

    const contentArea = screen.getByLabelText(/post content/i);
    fireEvent.input(contentArea, { target: { innerText: "Test" } });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /post/i })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: /post/i }));

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      const submitButton = buttons.find((btn) => btn.hasAttribute("disabled"));
      expect(submitButton).toBeDefined();
    });

    resolveSubmit!(undefined);
  });
});

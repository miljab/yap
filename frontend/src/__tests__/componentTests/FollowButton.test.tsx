import FollowButton from "@/components/FollowButton";
import { describe, vi, beforeEach, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

vi.mock("@/hooks/useFollow", () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

import useFollow from "@/hooks/useFollow";

const mockToggleFollow = vi.fn();

const mockIsFollowing = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useFollow).mockReturnValue({
    followingIds: new Set(),
    isFollowing: mockIsFollowing,
    toggleFollow: mockToggleFollow,
  });
  mockIsFollowing.mockReturnValue(false);
});

describe("FollowButton", () => {
  it("renders Follow button when not followed", () => {
    mockIsFollowing.mockReturnValue(false);
    render(<FollowButton userId="user-123" />);

    expect(screen.getByRole("button", { name: /follow/i })).toBeInTheDocument();
  });

  it("renders Followed button when already followed", () => {
    mockIsFollowing.mockReturnValue(true);
    render(<FollowButton userId="user-123" />);

    expect(screen.getByRole("button", { name: /followed/i })).toBeInTheDocument();
  });

  it("calls toggleFollow on click", async () => {
    mockToggleFollow.mockResolvedValueOnce(undefined);

    render(<FollowButton userId="user-123" />);

    const button = screen.getByRole("button", { name: /follow/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToggleFollow).toHaveBeenCalledWith("user-123");
    });
  });

  it("disables button while submitting", async () => {
    mockToggleFollow.mockImplementation(
      () => new Promise(() => {}),
    );

    render(<FollowButton userId="user-123" />);

    const button = screen.getByRole("button", { name: /follow/i });
    fireEvent.click(button);

    expect(button).toBeDisabled();
  });

  it("prevents double-click while submitting", async () => {
    mockToggleFollow.mockImplementation(
      () => new Promise(() => {}),
    );

    render(<FollowButton userId="user-123" />);

    fireEvent.click(screen.getByRole("button", { name: /follow/i }));
    fireEvent.click(screen.getByRole("button", { name: /follow/i }));

    expect(mockToggleFollow).toHaveBeenCalledTimes(1);
  });
});

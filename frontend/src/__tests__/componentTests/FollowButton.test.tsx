import FollowButton from "@/components/FollowButton";
import { describe, vi, beforeEach, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";

vi.mock("@/hooks/useAxiosPrivate", () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

import useAxiosPrivate from "@/hooks/useAxiosPrivate";

const mockAxiosPrivate = {
  put: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAxiosPrivate).mockReturnValue(mockAxiosPrivate as unknown as ReturnType<typeof useAxiosPrivate>);
});

describe("FollowButton", () => {
  it("renders Follow button when not followed", () => {
    render(<FollowButton initialIsFollowed={false} userId="user-123" />);

    expect(screen.getByRole("button", { name: /follow/i })).toBeInTheDocument();
  });

  it("renders Followed button when already followed", () => {
    render(<FollowButton initialIsFollowed={true} userId="user-123" />);

    expect(screen.getByRole("button", { name: /followed/i })).toBeInTheDocument();
  });

  it("optimistically toggles follow state on click", async () => {
    mockAxiosPrivate.put.mockResolvedValueOnce({ data: { isFollowed: true } });

    render(<FollowButton initialIsFollowed={false} userId="user-123" />);

    const button = screen.getByRole("button", { name: /follow/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /followed/i })).toBeInTheDocument();
    });
  });

  it("calls API with correct endpoint", async () => {
    mockAxiosPrivate.put.mockResolvedValueOnce({ data: { isFollowed: true } });

    render(<FollowButton initialIsFollowed={false} userId="user-123" />);

    fireEvent.click(screen.getByRole("button", { name: /follow/i }));

    await waitFor(() => {
      expect(mockAxiosPrivate.put).toHaveBeenCalledWith("/users/user-123/follow");
    });
  });

  it("reverts state on API error", async () => {
    mockAxiosPrivate.put.mockRejectedValueOnce(new Error("Network error"));

    render(<FollowButton initialIsFollowed={false} userId="user-123" />);

    fireEvent.click(screen.getByRole("button", { name: /follow/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /follow/i })).toBeInTheDocument();
    });
  });

  it("disables button while submitting", async () => {
    let resolveRequest: (value: unknown) => void;
    mockAxiosPrivate.put.mockImplementation(
      () => new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );

    render(<FollowButton initialIsFollowed={false} userId="user-123" />);

    const button = screen.getByRole("button", { name: /follow/i });
    fireEvent.click(button);

    expect(button).toBeDisabled();

    await act(async () => {
      resolveRequest!({ data: { isFollowed: true } });
    });
  });

  it("prevents double-click while submitting", async () => {
    mockAxiosPrivate.put.mockImplementation(
      () => new Promise(() => {}),
    );

    render(<FollowButton initialIsFollowed={false} userId="user-123" />);

    fireEvent.click(screen.getByRole("button", { name: /follow/i }));
    fireEvent.click(screen.getByRole("button", { name: /follow/i }));

    expect(mockAxiosPrivate.put).toHaveBeenCalledTimes(1);
  });
});

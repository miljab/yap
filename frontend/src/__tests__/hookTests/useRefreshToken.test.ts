import useRefreshToken from "@/hooks/useRefreshToken";
import type { Mock } from "vitest";
import { describe, vi, beforeEach, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("@/hooks/useAuth", () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock("@/api/axios", () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
  },
}));

import axios from "@/api/axios";
import useAuth from "@/hooks/useAuth";

describe("useRefreshToken", () => {
  let mockSetAuth: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetAuth = vi.fn();
    (useAuth as Mock).mockReturnValue({ setAuth: mockSetAuth });
  });

  it("returns a refresh function", () => {
    const { result } = renderHook(() => useRefreshToken());

    expect(typeof result.current).toBe("function");
  });

  it("refreshes token and updates auth state on success", async () => {
    const mockResponse = {
      data: {
        accessToken: "new-access-token",
      },
    };
    vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useRefreshToken());

    const newToken = await act(async () => {
      return await result.current();
    });

    expect(newToken).toBe("new-access-token");
    expect(mockSetAuth).toHaveBeenCalledTimes(1);
    const setAuthCall = mockSetAuth.mock.calls[0][0];
    expect(typeof setAuthCall).toBe("function");
    const updatedAuth = setAuthCall({ somePrev: "value" });
    expect(updatedAuth).toEqual({
      somePrev: "value",
      accessToken: "new-access-token",
    });
  });

  it("clears auth state on failure", async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useRefreshToken());

    await expect(
      act(async () => {
        await result.current();
      }),
    ).rejects.toThrow("Network error");

    expect(mockSetAuth).toHaveBeenCalledWith({});
  });

  it("uses correct endpoint and credentials", async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { accessToken: "token" },
    });

    const { result } = renderHook(() => useRefreshToken());

    await act(async () => {
      await result.current();
    });

    expect(axios.get).toHaveBeenCalledWith("/auth/refresh", {
      withCredentials: true,
    });
  });
});

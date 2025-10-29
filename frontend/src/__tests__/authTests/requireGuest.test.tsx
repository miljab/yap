import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router";
import RequireGuest from "@/components/RequireGuest";
import { render, screen, waitFor } from "@testing-library/react";
import useAuth from "@/hooks/useAuth";
import { type Mock } from "vitest";

vi.mock("@/hooks/useAuth", () => ({
  default: vi.fn(),
}));

describe("RequireGuest", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders children when not authenticated", async () => {
    (useAuth as Mock).mockReturnValue({
      auth: {},
    });

    render(
      <MemoryRouter initialEntries={["/guest"]}>
        <Routes>
          <Route element={<RequireGuest />}>
            <Route path="/guest" element={<div>Guest Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Guest Content")).toBeInTheDocument();
  });

  it("redirects authenticated user to /home", async () => {
    (useAuth as Mock).mockReturnValue({
      auth: {
        accessToken: "mock-token",
        user: { id: "user-id", createdAt: new Date() },
      },
    });

    render(
      <MemoryRouter initialEntries={["/guest"]}>
        <Routes>
          <Route element={<RequireGuest />}>
            <Route path="/guest" element={<div>Guest Content</div>} />
          </Route>
          <Route path="/home" element={<div>Home Content</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Home Content")).toBeInTheDocument();
    });
  });
});

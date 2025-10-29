import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router";
import { render, screen, waitFor } from "@testing-library/react";
import useAuth from "@/hooks/useAuth";
import { type Mock } from "vitest";
import RequireAuth from "@/components/RequireAuth";

vi.mock("@/hooks/useAuth", () => ({
  default: vi.fn(),
}));

describe("RequireAuth", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders children when authenticated", async () => {
    (useAuth as Mock).mockReturnValue({
      auth: {
        accessToken: "mock-token",
        user: { id: "user-id", createdAt: new Date() },
      },
    });

    render(
      <MemoryRouter initialEntries={["/auth"]}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/auth" element={<div>Auth Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Auth Content")).toBeInTheDocument();
  });

  it("redirects unauthenticated user to landing page", async () => {
    (useAuth as Mock).mockReturnValue({
      auth: {},
    });

    render(
      <MemoryRouter initialEntries={["/auth"]}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/auth" element={<div>Auth Content</div>} />
          </Route>
          <Route path="/" element={<div>Landing Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Landing Page")).toBeInTheDocument();
    });
  });
});

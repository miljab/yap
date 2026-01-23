import LoginCard from "@/components/auth_components/LoginCard";
import { MemoryRouter } from "react-router";
import { describe, vi, beforeEach, it, expect } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "@/api/axios";

vi.mock("@/hooks/useAuth", () => ({
  default: () => ({
    setAuth: vi.fn(),
  }),
}));
vi.mock("@/api/axios");

describe("LoginCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not submit form with empty fields", async () => {
    render(
      <MemoryRouter>
        <LoginCard />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  it("submits valid data and handles success", async () => {
    const mockResponse = {
      data: {
        accessToken: "fake-token",
        user: {
          id: "fake-id",
          email: "test@example.com",
          username: "testuser",
        },
      },
    };

    vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

    render(
      <MemoryRouter>
        <LoginCard />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email or username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "Password1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/auth/login",
        {
          identifier: "testuser",
          password: "Password1",
        },
        expect.any(Object),
      );
    });
  });

  it("shows server error on failed login", async () => {
    vi.mocked(axios.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: { error: "Wrong email/username or password" },
      },
    });

    render(
      <MemoryRouter>
        <LoginCard />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email or username/i), {
      target: { value: "wronguser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/wrong email\/username or password/i),
      ).toBeInTheDocument();
    });
  });
});

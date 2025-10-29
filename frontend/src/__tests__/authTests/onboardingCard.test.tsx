import axios from "@/api/axios";
import OnboardingCard from "@/components/OnboardingCard";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, vi, describe, it, expect } from "vitest";

vi.mock("@/hooks/useAuth", () => ({
  default: () => ({
    setAuth: vi.fn(),
  }),
}));
vi.mock("@/api/axios");

describe("OnboardingCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets email input disabled when email is already provided", async () => {
    const onboardingUser = {
      id: "some-user-id",
      email: "email@provider.com",
      createdAt: new Date(),
    };

    render(
      <MemoryRouter>
        <OnboardingCard onboardingUser={onboardingUser} />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/email/i)).toBeDisabled();
  });

  it("sets email input enabled when no email is provided", async () => {
    const onboardingUser = {
      id: "some-user-id",
      createdAt: new Date(),
    };

    render(
      <MemoryRouter>
        <OnboardingCard onboardingUser={onboardingUser} />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/email/i)).not.toBeDisabled();
  });

  it("shows validation error for invalid email", async () => {
    const onboardingUser = {
      id: "some-user-id",
      createdAt: new Date(),
    };

    render(
      <MemoryRouter>
        <OnboardingCard onboardingUser={onboardingUser} />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "invalidemail" },
    });
    fireEvent.blur(screen.getByLabelText(/email/i));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i));
    });
  });

  it("shows server error for taken email", async () => {
    vi.mocked(axios.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {
          errors: [{ path: "email", error: "Email already in use" }],
        },
      },
    });

    const onboardingUser = {
      id: "some-user-id",
      createdAt: new Date(),
    };

    render(
      <MemoryRouter>
        <OnboardingCard onboardingUser={onboardingUser} />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "taken@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
    });
  });

  it("shows error for too short username", async () => {
    const onboardingUser = {
      id: "some-user-id",
      email: "email@provider.com",
      createdAt: new Date(),
    };

    render(
      <MemoryRouter>
        <OnboardingCard onboardingUser={onboardingUser} />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "abc" },
    });
    fireEvent.click(screen.getByText(/confirm/i));

    await waitFor(() =>
      expect(
        screen.getByText(/username must be at least 5 characters/i),
      ).toBeInTheDocument(),
    );
  });

  it("shows error for too long username", async () => {
    const onboardingUser = {
      id: "some-user-id",
      email: "email@provider.com",
      createdAt: new Date(),
    };

    render(
      <MemoryRouter>
        <OnboardingCard onboardingUser={onboardingUser} />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "abc".repeat(12) },
    });
    fireEvent.click(screen.getByText(/confirm/i));

    await waitFor(() =>
      expect(
        screen.getByText(/username must be at most 32 characters/i),
      ).toBeInTheDocument(),
    );
  });

  it("shows error for username with forbidden characters", async () => {
    const onboardingUser = {
      id: "some-user-id",
      email: "email@provider.com",
      createdAt: new Date(),
    };

    render(
      <MemoryRouter>
        <OnboardingCard onboardingUser={onboardingUser} />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "Wrong!user" },
    });
    fireEvent.click(screen.getByText(/confirm/i));

    await waitFor(() =>
      expect(
        screen.getByText(
          /username can only contain letters, numbers and underscores/i,
        ),
      ).toBeInTheDocument(),
    );
  });

  it("shows server error for taken username", async () => {
    vi.mocked(axios.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {
          errors: [{ path: "username", error: "Username already in use" }],
        },
      },
    });

    const onboardingUser = {
      id: "some-user-id",
      email: "email@provider.com",
      createdAt: new Date(),
    };

    render(
      <MemoryRouter>
        <OnboardingCard onboardingUser={onboardingUser} />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "takenuser" },
    });
    fireEvent.click(screen.getByText(/confirm/i));

    await waitFor(() =>
      expect(screen.getByText(/username already in use/i)).toBeInTheDocument(),
    );
  });

  it("submits valid data", async () => {
    const createdAt = new Date();

    vi.mocked(axios.post).mockResolvedValueOnce({
      data: {
        accessToken: "sample-token",
        user: {
          id: "user-id",
          email: "test@example.com",
          username: "validuser",
          createdAt: createdAt,
        },
      },
    });

    const onboardingUser = {
      id: "user-id",
      email: "test@example.com",
      createdAt: createdAt,
    };

    render(
      <MemoryRouter>
        <OnboardingCard onboardingUser={onboardingUser} />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "validuser" },
    });
    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/auth/onboarding",
        expect.objectContaining({
          email: "test@example.com",
          username: "validuser",
        }),
        expect.any(Object),
      );
    });
  });
});

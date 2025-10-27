import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "@/api/axios";
import SignupCard from "@/components/SignupCard";
import { MemoryRouter } from "react-router";

vi.mock("@/api/axios");

describe("SignupCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows error for invalid email", async () => {
    render(
      <MemoryRouter>
        <SignupCard />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "invalidemail" },
    });
    fireEvent.blur(screen.getByLabelText(/email/i));
    fireEvent.click(screen.getByText(/create account/i));

    await waitFor(() =>
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument(),
    );
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

    render(
      <MemoryRouter>
        <SignupCard />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "taken@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password1" },
    });
    fireEvent.click(screen.getByText(/create account/i));

    await waitFor(() =>
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument(),
    );
  });

  it("shows error for too short username", async () => {
    render(
      <MemoryRouter>
        <SignupCard />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "abc" },
    });
    fireEvent.click(screen.getByText(/create account/i));

    await waitFor(() =>
      expect(
        screen.getByText(/username must be at least 5 characters/i),
      ).toBeInTheDocument(),
    );
  });

  it("shows error for too long username", async () => {
    render(
      <MemoryRouter>
        <SignupCard />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "abc".repeat(12) },
    });
    fireEvent.click(screen.getByText(/create account/i));

    await waitFor(() =>
      expect(
        screen.getByText(/username must be at most 32 characters/i),
      ).toBeInTheDocument(),
    );
  });

  it("shows error for username with forbidden characters", async () => {
    render(
      <MemoryRouter>
        <SignupCard />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "Wrong!user" },
    });
    fireEvent.click(screen.getByText(/create account/i));

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

    render(
      <MemoryRouter>
        <SignupCard />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "takenuser" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password1" },
    });
    fireEvent.click(screen.getByText(/create account/i));

    await waitFor(() =>
      expect(screen.getByText(/username already in use/i)).toBeInTheDocument(),
    );
  });

  it("shows error for too short password", async () => {
    render(
      <MemoryRouter>
        <SignupCard />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Pass1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "Pass1" },
    });
    fireEvent.click(screen.getByText(/create account/i));

    await waitFor(() =>
      expect(
        screen.getByText(/password must be at least 8 characters/i),
      ).toBeInTheDocument(),
    );
  });

  it("shows error for too long password", async () => {
    render(
      <MemoryRouter>
        <SignupCard />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Pass1".repeat(15) },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "Pass1".repeat(15) },
    });
    fireEvent.click(screen.getByText(/create account/i));

    await waitFor(() =>
      expect(
        screen.getByText(/password must be at most 64 characters/i),
      ).toBeInTheDocument(),
    );
  });

  it("shows error for password without at least one uppercase character", async () => {
    render(
      <MemoryRouter>
        <SignupCard />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "password1" },
    });
    fireEvent.click(screen.getByText(/create account/i));

    await waitFor(() =>
      expect(
        screen.getByText(
          /password must contain at least one number and one uppercase letter/i,
        ),
      ).toBeInTheDocument(),
    );
  });

  it("shows error for password without at least one number", async () => {
    render(
      <MemoryRouter>
        <SignupCard />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "Password" },
    });
    fireEvent.click(screen.getByText(/create account/i));

    await waitFor(() =>
      expect(
        screen.getByText(
          /password must contain at least one number and one uppercase letter/i,
        ),
      ).toBeInTheDocument(),
    );
  });

  it("shows error for password mismatch", async () => {
    render(
      <MemoryRouter>
        <SignupCard />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "Password2" },
    });
    fireEvent.click(screen.getByText(/create account/i));

    await waitFor(() =>
      expect(screen.getByText(/passwords must match/i)).toBeInTheDocument(),
    );
  });

  it("submits valid data and handles success", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { userId: "123" } });

    render(
      <MemoryRouter>
        <SignupCard />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password1" },
    });
    fireEvent.click(screen.getByText(/create account/i));

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith("/auth/signup", {
        email: "test@example.com",
        username: "validuser",
        password: "Password1",
        confirmPassword: "Password1",
      }),
    );
  });
});

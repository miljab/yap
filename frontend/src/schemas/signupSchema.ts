import { z } from "zod";

const usernamePattern = /^[a-zA-Z0-9_]+$/;
const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,64}$/;

export const signupSchema = z
  .object({
    email: z.email({ error: "Invalid email address" }),
    username: z
      .string()
      .min(5, { error: "Username must be at least 5 characters" })
      .max(32, { error: "Username must be at most 32 characters" })
      .regex(usernamePattern, {
        error: "Username can only contain letters, numbers and underscores",
      }),
    password: z
      .string()
      .min(8, { error: "Password must be at least 8 characters" })
      .max(64, { error: "Password must be at most 64 characters" })
      .regex(passwordPattern, {
        error:
          "Password must contain at least one number and one uppercase letter",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords must match",
    path: ["confirmPassword"],
  });

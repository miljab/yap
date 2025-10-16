import z from "zod";

const usernamePattern = /^[a-zA-Z0-9_]+$/;

export const onboardingSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  username: z
    .string()
    .min(5, { error: "Username must be at least 5 characters" })
    .max(32, { error: "Username must be at most 32 characters" })
    .regex(usernamePattern, {
      error: "Username can only contain letters, numbers and underscores",
    }),
});

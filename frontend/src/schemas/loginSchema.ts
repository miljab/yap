import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, { error: "Email or username is required" }),
  password: z.string().min(1, { error: "Password is required" }),
});

import { email, z } from "zod";
import { prisma } from "../prisma/prismaClient.js";

const usernamePattern = /^[a-zA-Z0-9_]+$/;
const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,64}$/;

export const signupSchema = z
  .object({
    email: z.email(),
    username: z.string().min(5).max(32).regex(usernamePattern),
    password: z.string().min(8).max(64).regex(passwordPattern),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords must match",
    path: ["confirmPassword"],
  });

export const signupSchemaWithDb = signupSchema
  .refine(
    async (data) => {
      const emailExists = await prisma.user.findUnique({
        where: {
          email: data.email.toLowerCase(),
        },
      });
      return !emailExists;
    },
    { error: "Email already in use", path: ["email"] }
  )
  .refine(
    async (data) => {
      const usernameExists = await prisma.user.findUnique({
        where: {
          username: data.username.toLowerCase(),
        },
      });
      return !usernameExists;
    },
    { error: "Username already in use", path: ["username"] }
  );

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export const usernameSchema = z
  .object({
    username: z.string().min(5).max(32).regex(usernamePattern),
  })
  .refine(
    async (data) => {
      const usernameExists = await prisma.user.findUnique({
        where: {
          username: data.username.toLowerCase(),
        },
      });
      return !usernameExists;
    },
    { error: "Username already in use", path: ["username"] }
  );

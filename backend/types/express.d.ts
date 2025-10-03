import { User } from "@prisma/client";

type UserWithoutPassword = Omit<User, "password">;

declare global {
  namespace Express {
    export interface Request {
      user?: UserWithoutPassword;
    }
  }
}

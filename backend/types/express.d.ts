import { type User } from "@prisma/client";
import * as express from "express";

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}

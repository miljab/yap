import { type User } from "@prisma/client";
import * as express from "express";

declare module "express-serve-static-core" {
  export interface Request {
    user?: User;
  }
}

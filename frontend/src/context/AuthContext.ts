import { createContext } from "react";
import type { User } from "@/types/user";

type AuthState = {
  accessToken?: string;
  user?: User;
};

type AuthContextType = {
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
};

export const AuthContext = createContext<AuthContextType>({
  auth: {},
  setAuth: () => {},
});

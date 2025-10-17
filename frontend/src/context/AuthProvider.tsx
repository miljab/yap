import { createContext, useState, useEffect, type ReactNode } from "react";
import axios from "../api/axios";
import type { User } from "@/types/user";
import { Spinner } from "@/components/ui/spinner";

type AuthState = {
  accessToken?: string;
  user?: User;
};

type AuthContextType = {
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
};

const AuthContext = createContext<AuthContextType>({
  auth: {},
  setAuth: () => {},
});

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [auth, setAuth] = useState<AuthState>({});
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await axios.get<AuthState>("/auth/refresh", {
          withCredentials: true,
        });

        const { user, accessToken } = response.data;
        setAuth({ user, accessToken });
      } catch (error) {
        console.error("Session validation failed: ", error);
        setAuth({});
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2">
        Loading... <Spinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

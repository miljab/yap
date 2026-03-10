import { useState, useEffect } from "react";
import axios from "../api/axios";
import { fetchCsrfToken } from "../api/axios";
import { AuthContext } from "./AuthContext";
import { Spinner } from "@/components/ui/spinner";

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [auth, setAuth] = useState<{ accessToken?: string; user?: import("@/types/user").User }>({});
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initApp = async () => {
      await fetchCsrfToken();
      try {
        const response = await axios.get<{ user?: import("@/types/user").User; accessToken?: string }>("/auth/refresh", {
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

    initApp();
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

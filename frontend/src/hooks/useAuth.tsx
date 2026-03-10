import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function useAuth() {
  const { auth, setAuth } = useContext(AuthContext);

  if (!auth) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return { auth, setAuth };
}

export default useAuth;

import { useContext } from "react";
import AuthContext from "../context/AuthProvider";

function useAuth() {
  const { auth, setAuth } = useContext(AuthContext);

  if (!auth.accessToken) {
    throw new Error("User is not authenticated");
  }

  return { auth, setAuth };
}

export default useAuth;

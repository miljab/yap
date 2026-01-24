import { type User } from "@/types/user";
import useAuth from "./useAuth";

function useAuthenticatedUser(): User {
  const { auth } = useAuth();

  if (!auth.user) throw new Error("User must be authenticated in this hook");

  return auth.user;
}

export default useAuthenticatedUser;

import useAuth from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router";

function RequireGuest() {
  const { auth } = useAuth();

  return auth.accessToken ? <Navigate to="/home" /> : <Outlet />;
}

export default RequireGuest;

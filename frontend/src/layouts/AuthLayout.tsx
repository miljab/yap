import Nav from "@/components/Nav";
import { Outlet } from "react-router";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <Nav />
      <Outlet />
    </div>
  );
}

export default AuthLayout;

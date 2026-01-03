import Nav from "@/components/Nav";
import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "react-router";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <Toaster richColors />
      <Nav />
      <Outlet />
    </div>
  );
}

export default AuthLayout;

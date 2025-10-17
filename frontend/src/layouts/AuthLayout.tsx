import Nav from "@/components/Nav";
import { Outlet } from "react-router";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <div className="flex flex-row p-2 md:flex-col">
        <h1 className="hidden text-3xl tracking-wider md:block">yap.</h1>
        <Nav />
      </div>
      <Outlet />
    </div>
  );
}

export default AuthLayout;

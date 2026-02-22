import Nav from "@/components/Nav";
import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "react-router";

function PostViewLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <Toaster richColors />
      <Nav hidden={true} />
      <Outlet />
    </div>
  );
}

export default PostViewLayout;

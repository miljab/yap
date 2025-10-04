import ToggleTheme from "@/components/ui/ToggleTheme";
import { Outlet } from "react-router";

function PublicLayout() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="absolute top-4 right-4">
        <ToggleTheme />
      </div>
      <Outlet />
    </div>
  );
}

export default PublicLayout;

import type { NavigationState } from "@/types/navigation";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const { origin, historyStack } = (location.state as NavigationState) || {};

    if (Array.isArray(historyStack) && historyStack.length > 0) {
      const newStack = [...historyStack];
      const prevPath = newStack.pop();

      if (prevPath) {
        navigate(prevPath, {
          state: {
            origin,
            historyStack: newStack,
            restoreCache: true,
          },
        });
        return;
      }
    }

    if (origin) {
      navigate(origin, { state: { restoreCache: true } });
    } else {
      navigate("/home", { state: { restoreCache: true } });
    }
  };

  return (
    <div className="sticky top-0 flex h-12 items-center justify-start border-b">
      <button className="h-full cursor-pointer p-2 px-4" onClick={handleBack}>
        <ArrowLeft />
      </button>
      <span className="font-[Roboto_mono] text-2xl">Post</span>
    </div>
  );
}

export default BackButton;

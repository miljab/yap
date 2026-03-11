import type { NavigationState } from "@/types/navigation";
import type { NavigateFunction } from "react-router";

const preventNavigation = (
  e: React.MouseEvent<HTMLDivElement>,
  navigate: NavigateFunction,
  itemType: "post" | "comment",
  itemId: string,
  currentPath: string,
  currentState?: NavigationState,
) => {
  const selection = window.getSelection();

  if (
    selection &&
    selection.type === "Range" &&
    selection.toString().length > 0
  ) {
    return;
  }

  const target = e.target as HTMLElement;

  if (
    target.closest("button") ||
    target.closest("a") ||
    target.closest("[data-no-navigate]")
  ) {
    return;
  }

  const targetPath = `/${itemType}/${itemId}`;

  const origin = currentState?.origin || currentState?.from || currentPath;
  let historyStack = Array.isArray(currentState?.historyStack)
    ? [...currentState.historyStack]
    : [];

  const targetIndex = historyStack.indexOf(targetPath);

  if (targetIndex !== -1) {
    historyStack = historyStack.slice(0, targetIndex);
  } else {
    historyStack.push(currentPath);
  }

  navigate(targetPath, {
    state: {
      origin,
      historyStack,
    },
  });
};

export default preventNavigation;

import type { NavigateFunction } from "react-router";

const preventNavigation = (
  e: React.MouseEvent<HTMLDivElement>,
  navigate: NavigateFunction,
  itemType: "post" | "comment",
  itemId: string,
  state?: Record<string, unknown>,
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

  navigate(`/${itemType}/${itemId}`, { state });
};

export default preventNavigation;

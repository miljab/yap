import { useState } from "react";
import { useNavigationType, useLocation, NavigationType } from "react-router";
import type { NavigationState } from "@/types/navigation";

export function useCachedTab(
  key: string,
  defaultValue: string,
): [string, (value: string) => void] {
  const navType = useNavigationType();
  const location = useLocation();

  const isBackNavigation =
    navType === NavigationType.Pop ||
    (location.state as NavigationState)?.restoreCache === true;

  const [activeTab, setActiveTab] = useState(() => {
    if (isBackNavigation) {
      return sessionStorage.getItem(`${key}:activeTab`) || defaultValue;
    }
    return defaultValue;
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    sessionStorage.setItem(`${key}:activeTab`, value);
  };

  return [activeTab, handleTabChange];
}

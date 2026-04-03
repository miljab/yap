import { useState } from "react";
import { useNavigationType, useLocation, NavigationType } from "react-router";
import type { NavigationState } from "@/types/navigation";

export function useCachedValue<T extends string>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const navType = useNavigationType();
  const location = useLocation();

  const isBackNavigation =
    navType === NavigationType.Pop ||
    (location.state as NavigationState)?.restoreCache === true;

  const [value, setValue] = useState<T>(() => {
    if (isBackNavigation) {
      return (sessionStorage.getItem(key) as T) || defaultValue;
    }
    return defaultValue;
  });

  const handleChange = (newValue: T) => {
    setValue(newValue);
    sessionStorage.setItem(key, newValue);
  };

  return [value, handleChange];
}

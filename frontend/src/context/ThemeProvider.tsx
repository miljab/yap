import { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: "dark" | "light";
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "uiTheme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem(storageKey) as "dark" | "light") || defaultTheme,
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    let appliedTheme = theme;
    if (!localStorage.getItem(storageKey)) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      appliedTheme = systemTheme;
    } else {
      root.classList.add(theme);
    }

    setTheme(appliedTheme);
    setIsLoaded(true);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: "dark" | "light") => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
